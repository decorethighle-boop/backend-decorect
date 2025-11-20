import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { ProductType } from 'src/modules/products/entities/product-type.entity';
import { Product } from 'src/modules/products/entities/product.entity';
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
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
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
      .leftJoinAndSelect('category.productType', 'productType')
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
      throw new CustomHttpException(
        'The selected product type does not exist.',
      );
    }

    category.productType = productType;
    category.grouper = body.grouper ?? false;

    if (category.grouper) {
      const existingGrouper = await this.categoriesRepository.findOne({
        where: { productType: { id: body.productTypeId }, grouper: true },
      });

      if (existingGrouper) {
        throw new CustomHttpException(
          'There is already a main category for this product type. You can only have one main category.',
        );
      }
    }

    await this.categoriesRepository.save(category);
  }

  async updateCategory(body: CreateOrUpdateCategoryDto) {
    // 1️⃣ Find the category to update
    const category = await this.categoriesRepository.findOne({
      where: { id: body.id },
      relations: ['productType'],
    });
    if (!category) throw new NotFoundException('Category not found');

    // 2️⃣ Update name
    category.name = body.name;

    // 3️⃣ Validate product type
    const productType = await this.productTypesRepository.findOne({
      where: { id: body.productTypeId },
    });
    if (!productType) {
      throw new CustomHttpException(
        'The selected product type does not exist.',
      );
    }
    category.productType = productType;

    // 4️⃣ Set grouper (default false)
    category.grouper = body.grouper ?? false;

    // 5️⃣ Validate before setting grouper
    if (category.grouper) {
      // Fetch all products of this product type
      const products = await this.productsRepository.find({
        where: { productType: { id: body.productTypeId } },
      });

      // Check if any product is missing this category
      const productsMissingCategory = products.filter(
        product =>
          !product.categories.some(cat => cat.category_id === category.id),
      );

      if (productsMissingCategory.length > 0) {
        throw new CustomHttpException(
          'Cannot set this category as main because some products do not include it.',
        );
      }

      // Disable existing grouper if any
      const existingGrouper = await this.categoriesRepository.findOne({
        where: { productType: { id: body.productTypeId }, grouper: true },
      });

      if (existingGrouper && existingGrouper.id !== category.id) {
        existingGrouper.grouper = false;
        await this.categoriesRepository.save(existingGrouper);
      }
    }

    // 6️⃣ Save updated category
    await this.categoriesRepository.save(category);

    // 7️⃣ Update products' categories JSON
    const productsToUpdate = await this.productsRepository.find({
      where: { productType: { id: body.productTypeId } },
    });

    for (const product of productsToUpdate) {
      product.categories = product.categories.map(cat => ({
        ...cat,
        grouper: cat.category_id === category.id ? category.grouper : false,
      }));

      await this.productsRepository.save(product);
    }
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
