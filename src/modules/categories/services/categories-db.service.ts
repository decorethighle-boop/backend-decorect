import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrUpdateCategoryValueDto } from '../dto/create-or-update-category-value.dto';
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

  async ensureDefaultCategories() {
    const defaultCategories = [
      'Style',
      'Shape',
      'Size',
      'Finish',
      'Material',
      'Color',
      'Area',
    ];

    for (const name of defaultCategories) {
      const exists = await this.categoriesRepository.findOne({
        where: { name },
      });
      if (!exists) {
        const category = this.categoriesRepository.create({
          name,
          canBeDeleted: false,
        });
        await this.categoriesRepository.save(category);
      }
    }
  }

  async findCategoryValueById(id: string) {
    return this.categoryValuesRepository.findOne({
      where: { id },
      relations: ['parentCategory'],
    });
  }

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

  async getCategoryValuesGrouped(productTypeId: string) {
    const categoryValues = await this.categoryValuesRepository
      .createQueryBuilder('categoryValue')
      .leftJoinAndSelect('categoryValue.parentCategory', 'parentCategory')
      .where('categoryValue.productType = :productTypeId', { productTypeId })
      .orderBy('parentCategory.name', 'ASC')
      .addOrderBy('categoryValue.name', 'ASC')
      .getMany();

    return categoryValues;
  }

  async createCategoryValue(body: CreateOrUpdateCategoryValueDto) {
    const parentCategory = await this.categoriesRepository.findOne({
      where: { id: body.parentCategoryId },
    });
    if (!parentCategory) {
      throw new NotFoundException(`Parent category not found`);
    }

    const categoryValue = new CategoryValue();
    categoryValue.name = body.name;
    categoryValue.parentCategory = parentCategory;

    if (body.productTypeId) {
      categoryValue.productType = { id: body.productTypeId } as any;
    }

    const x = await this.categoryValuesRepository.save(categoryValue);

    return categoryValue;
  }

  async updateCategoryValue(body: CreateOrUpdateCategoryValueDto) {
    const categoryValue = await this.categoryValuesRepository.findOne({
      where: { id: body.id },
    });
    if (!categoryValue) throw new NotFoundException(`Category value not found`);

    categoryValue.name = body.name;

    await this.categoryValuesRepository.save(categoryValue);
    return categoryValue;
  }

  async deleteCategoryValue(id: string) {
    const categoryValue = await this.categoryValuesRepository.findOne({
      where: { id },
    });
    if (!categoryValue) throw new NotFoundException(`Category value not found`);
    await this.categoryValuesRepository.remove(categoryValue);
  }
}
