import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrUpdateCategoryDto } from '../dto/create-or-update-category.dto';
import { CategoryValue } from '../entities/category-value.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesDbService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(CategoryValue)
    private readonly categoryValuesRepository: Repository<CategoryValue>,
  ) {}

  // --------------------------------------------------------------------------------
  // Categories
  // --------------------------------------------------------------------------------

  async getCategoriesQueryBuilder() {
    return this.categoriesRepository.createQueryBuilder('category');
  }

  async createCategory(body: CreateOrUpdateCategoryDto) {
    const category = new Category();
    category.name = body.name;
    await this.categoriesRepository.save(category);
    return category;
  }

  async updateCategory(body: CreateOrUpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({
      where: { id: body.id },
    });
    if (!category) throw new NotFoundException(`Category not found`);
    category.name = body.name;
    await this.categoriesRepository.save(category);
    return category;
  }

  async deleteCategory(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category not found`);
    await this.categoriesRepository.remove(category);
  }

  // --------------------------------------------------------------------------------
  // Categories Values
  // --------------------------------------------------------------------------------
}
