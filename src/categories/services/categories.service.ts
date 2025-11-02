// src/modules/categories/services/categories.service.tso '../global/slug.util' según tus paths
import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { cleanSlugInput, slugify } from 'src/global/slug/slug.util';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { CategoriesDbService } from './categories-db.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: CategoriesDbService) {}

  async create(dto: CreateCategoryDto) {
    let parent: Category | null = null;
    if (dto.parentId) {
      parent = await this.db.findById(dto.parentId);
      if (!parent)
        throw new CustomHttpException(
          'Parent category not found',
          HttpStatus.NOT_FOUND,
        );
      if (parent.parent)
        throw new CustomHttpException(
          'Only two levels allowed (parent → child).',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }

    const cat = new Category();
    cat.name = dto.name;
    cat.parent = parent ?? null;
    cat.description = dto.description ?? null;
    cat.isActive = dto.isActive ?? true;
    cat.sortOrder = dto.sortOrder ?? 0;
    cat.iconUrl = dto.iconUrl ?? null;
    cat.imageUrl = dto.imageUrl ?? null;

    // si el front manda slug → lo limpiamos; si no, lo generamos desde el name
    const baseSlug = dto.slug
      ? slugify(cleanSlugInput(dto.slug))
      : slugify(dto.name);
    cat.slug = await this.ensureUniqueSlug(baseSlug);

    return this.db.save(cat);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.db.findById(id);
    if (!cat)
      throw new CustomHttpException('Category not found', HttpStatus.NOT_FOUND);

    if (dto.name !== undefined) cat.name = dto.name;
    if (dto.description !== undefined)
      cat.description = dto.description ?? null;
    if (dto.isActive !== undefined) cat.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) cat.sortOrder = dto.sortOrder ?? 0;
    if (dto.iconUrl !== undefined) cat.iconUrl = dto.iconUrl ?? null;
    if (dto.imageUrl !== undefined) cat.imageUrl = dto.imageUrl ?? null;

    // jerarquía 2 niveles
    if (dto.parentId !== undefined) {
      if (dto.parentId === id)
        throw new CustomHttpException(
          'A category cannot be its own parent.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      if (dto.parentId === null) {
        cat.parent = null;
      } else {
        const newParent = await this.db.findById(dto.parentId);
        if (!newParent)
          throw new CustomHttpException(
            'Parent category not found',
            HttpStatus.NOT_FOUND,
          );
        if (newParent.parent)
          throw new CustomHttpException(
            'Only two levels allowed (parent → child).',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        if (cat.children && cat.children.length > 0) {
          throw new CustomHttpException(
            'This category has children; detach/move them first to keep only two levels.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        cat.parent = newParent;
      }
    }

    // sólo cambiamos el slug si el cliente lo envía
    if (dto.slug !== undefined) {
      const base = slugify(cleanSlugInput(dto.slug));
      cat.slug = await this.ensureUniqueSlug(base, cat.id);
    }

    return this.db.save(cat);
  }

  /** Si el slug existe, añade sufijos -2, -3, ... hasta que sea único. */
  private async ensureUniqueSlug(base: string, exceptId?: string) {
    let candidate = base;
    let i = 2;

    if (exceptId) {
      while (await this.db.slugExistsExcept(candidate, exceptId)) {
        candidate = `${base}-${i++}`;
      }
    } else {
      while (await this.db.slugExists(candidate)) {
        candidate = `${base}-${i++}`;
      }
    }
    return candidate;
  }
}
