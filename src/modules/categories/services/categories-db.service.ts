import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { ProductType } from 'src/modules/products/entities/product-type.entity';
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
    @InjectRepository(ProductType)
    private readonly productTypesRepository: Repository<ProductType>,
  ) {}

  // --------------------------------------------------------------------------------
  // Categories
  // --------------------------------------------------------------------------------

  async findCategoryValueById(id: string) {
    return this.categoryValuesRepository.findOne({
      where: { id },
      relations: ['parentCategory'],
    });
  }

  async getCategoriesQueryBuilder(productTypeId: string) {
    return this.categoriesRepository
      .createQueryBuilder('category')
      .where('category.productType = :productTypeId', { productTypeId });
  }

  async createCategory(body: CreateOrUpdateCategoryDto) {
    const category = new Category();
    category.id = body.id;
    category.name = body.name;

    const productType = await this.productTypesRepository.findOne({
      where: { id: body.productTypeId },
    });

    if (!productType) {
      throw new CustomHttpException('Product type not found');
    }

    category.productType = productType;
    category.grouper = body.grouper ?? false;

    if (category.grouper) {
      const existingGrouper = await this.categoriesRepository.findOne({
        where: { productType: { id: body.productTypeId }, grouper: true },
      });

      if (existingGrouper) {
        existingGrouper.grouper = false;
        await this.categoriesRepository.save(existingGrouper);
      }
    }

    await this.categoriesRepository.save(category);
  }

  async updateCategory(body: CreateOrUpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({
      where: { id: body.id },
    });
    if (!category) throw new NotFoundException(`Category not found`);

    category.name = body.name;

    const productType = await this.productTypesRepository.findOne({
      where: { id: body.productTypeId },
    });

    if (!productType) {
      throw new CustomHttpException('Product type not found');
    }

    category.productType = productType;
    category.grouper = body.grouper ?? false;

    if (category.grouper) {
      const existingGrouper = await this.categoriesRepository.findOne({
        where: { productType: { id: body.productTypeId }, grouper: true },
      });

      if (existingGrouper && existingGrouper.id !== category.id) {
        existingGrouper.grouper = false;
        await this.categoriesRepository.save(existingGrouper);
      }
    }

    await this.categoriesRepository.save(category);
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
      .where('parentCategory.productType = :productTypeId', { productTypeId })
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
    categoryValue.id = body.id;
    categoryValue.name = body.name;
    categoryValue.parentCategory = parentCategory;

    await this.categoryValuesRepository.save(categoryValue);
  }

  async updateCategoryValue(body: CreateOrUpdateCategoryValueDto) {
    const categoryValue = await this.categoryValuesRepository.findOne({
      where: { id: body.id },
    });
    if (!categoryValue) throw new NotFoundException(`Category value not found`);

    categoryValue.name = body.name;
    const parentCategory = await this.categoriesRepository.findOne({
      where: { id: body.parentCategoryId },
    });
    if (!parentCategory) {
      throw new NotFoundException(`Parent category not found`);
    }
    categoryValue.parentCategory = parentCategory;

    await this.categoryValuesRepository.save(categoryValue);
  }

  async deleteCategoryValue(id: string) {
    const categoryValue = await this.categoryValuesRepository.findOne({
      where: { id },
    });
    if (!categoryValue) throw new NotFoundException(`Category value not found`);
    await this.categoryValuesRepository.remove(categoryValue);
  }
}
