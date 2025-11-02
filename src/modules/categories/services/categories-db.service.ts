// src/modules/categories/services/categories-db.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

type BoolOpt = boolean | undefined;

@Injectable()
export class CategoriesDbService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findById(id: string): Promise<Category | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  findBySlug(slug: string, onlyActive?: BoolOpt): Promise<Category | null> {
    return this.repo.findOne({
      where: { slug, ...(onlyActive ? { isActive: true } : {}) },
      relations: ['parent', 'children'],
    });
  }

  findChildrenOf(parentId: string, onlyActive?: BoolOpt): Promise<Category[]> {
    return this.repo.find({
      where: {
        parent: { id: parentId },
        ...(onlyActive ? { isActive: true } : {}),
      },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findRoots(
    includeChildren: BoolOpt = true,
    onlyActive: BoolOpt = false,
  ): Promise<Category[]> {
    return this.repo.find({
      where: {
        parent: IsNull(),
        ...(onlyActive ? { isActive: true } : {}),
      },
      relations: includeChildren ? ['children'] : [],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findParentsOnly(
    onlyActive?: BoolOpt,
  ): Promise<Pick<Category, 'id' | 'name' | 'slug'>[]> {
    return this.repo.find({
      where: {
        parent: IsNull(),
        ...(onlyActive ? { isActive: true } : {}),
      },
      select: { id: true, name: true, slug: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    }) as Promise<Pick<Category, 'id' | 'name' | 'slug'>[]>;
  }

  slugExists(slug: string): Promise<boolean> {
    return this.repo.exists({ where: { slug } });
  }

  slugExistsExcept(slug: string, exceptId: string): Promise<boolean> {
    return this.repo.exists({ where: { slug, id: Not(exceptId) } });
  }

  save(entity: Category): Promise<Category> {
    return this.repo.save(entity);
  }

  remove(entity: Category): Promise<Category> {
    return this.repo.remove(entity);
  }
}
