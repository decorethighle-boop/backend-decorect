import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { ProductType } from 'src/modules/products/entities/product-type.entity';
import {
  GeneratedVariant,
  Product,
} from 'src/modules/products/entities/product.entity';
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

    // Almacenar el nombre anterior para la actualización en productos
    const oldCategoryName = category.name;
    const newCategoryName = body.name;

    // 2️⃣ Update name
    category.name = newCategoryName;

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

    // 7️⃣ Update products' categories JSON (name and grouper)
    await this.updateProductsCategoryData(
      category.productType.id,
      category.id,
      newCategoryName,
      category.grouper,
      'category', // Indica que se actualiza el nombre de la categoría
      oldCategoryName,
    );
  }

  async deleteCategory(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category not found`);
    await this.categoriesRepository.remove(category);
  }

  // --------------------------------------------------------------------------------
  // Categories Values
  // --------------------------------------------------------------------------------

  async getCategoryValuesGrouped(
    productTypeId: string,
    user: any,
    all: boolean,
  ) {
    const qb = this.categoryValuesRepository
      .createQueryBuilder('categoryValue')
      .leftJoinAndSelect('categoryValue.parentCategory', 'parentCategory')
      .where('parentCategory.productType = :productTypeId', { productTypeId });

    if (user?.parentRole?.hierarchy !== 2 || !all) {
      qb.andWhere(
        `
      EXISTS (
        SELECT 1
        FROM products p
        WHERE p.product_type_id = :productTypeId
        AND (
          -- Condición 1: El categoryValue está en alguna variante
          (
            -- Buscar en variant.categories (array de objetos)
            jsonb_path_exists(
              p.variants,
              CONCAT(
                '$[*].categories[*] ? (@.categoryValueId == "',
                categoryValue.id,
                '")'
              )::jsonpath
            )
            OR
            -- Buscar en variant.values (array de objetos)
            jsonb_path_exists(
              p.variants,
              CONCAT(
                '$[*].values[*] ? (@.valueId == "',
                categoryValue.id,
                '")'
              )::jsonpath
            )
          )
          OR
          -- Condición 2: La categoría padre tiene depends_on = false y el categoryValue está en alguna variante
          (
            jsonb_path_exists(
              p.categories,
              CONCAT(
                '$[*] ? (@.category_id == "',
                parentCategory.id,
                '" && @.depends_on == false)'
              )::jsonpath
            )
            AND
            -- Verificar que el categoryValue está en alguna variante del mismo producto
            (
              jsonb_path_exists(
                p.variants,
                CONCAT(
                  '$[*].categories[*] ? (@.categoryValueId == "',
                  categoryValue.id,
                  '")'
                )::jsonpath
              )
              OR
              jsonb_path_exists(
                p.variants,
                CONCAT(
                  '$[*].values[*] ? (@.valueId == "',
                  categoryValue.id,
                  '")'
                )::jsonpath
              )
            )
          )
        )
      )
    `,
      );
    }

    const categoryValues = await qb
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
      relations: ['parentCategory', 'parentCategory.productType'],
    });

    if (!categoryValue) throw new NotFoundException(`Category value not found`);

    const newCategoryValueName = body.name;
    const oldCategoryValueName = categoryValue.name;

    const productTypeId = categoryValue.parentCategory.productType.id;

    categoryValue.name = newCategoryValueName;

    if (categoryValue.parentCategory.id !== body.parentCategoryId) {
      const parentCategory = await this.categoriesRepository.findOne({
        where: { id: body.parentCategoryId },
      });
      if (!parentCategory) {
        throw new NotFoundException(`Parent category not found`);
      }
      categoryValue.parentCategory = parentCategory;
    }

    await this.categoryValuesRepository.save(categoryValue);

    await this.updateProductsCategoryData(
      productTypeId,
      categoryValue.parentCategory.id,
      newCategoryValueName,
      undefined,
      'value',
      oldCategoryValueName,
      categoryValue.id,
    );
  }

  async deleteCategoryValue(id: string) {
    const categoryValue = await this.categoryValuesRepository.findOne({
      where: { id },
    });
    if (!categoryValue) throw new NotFoundException(`Category value not found`);
    await this.categoryValuesRepository.remove(categoryValue);
  }

  // --------------------------------------------------------------------------------
  // Helper para actualizar productos
  // --------------------------------------------------------------------------------

  /**
   * Actualiza el nombre de la categoría o el valor en la data JSON de los productos.
   * @param productTypeId ID del tipo de producto.
   * @param categoryId ID de la categoría afectada.
   * @param newName El nuevo nombre.
   * @param grouper El estado 'grouper' (solo si es actualización de categoría).
   * @param updateType 'category' para nombre de categoría, 'value' para nombre de valor.
   * @param oldName El nombre anterior (para variantes de categoría).
   * @param categoryValueId ID del valor de la categoría (solo si updateType es 'value').
   */
  private async updateProductsCategoryData(
    productTypeId: string,
    categoryId: string,
    newName: string,
    grouper: boolean | undefined,
    updateType: 'category' | 'value',
    oldName?: string,
    categoryValueId?: string,
  ) {
    const productsToUpdate = await this.productsRepository.find({
      where: { productType: { id: productTypeId } },
    });

    for (const product of productsToUpdate) {
      let updatedCategories = product.categories;
      let updatedVariants: GeneratedVariant[] = product.variants;
      let changesMade = false;

      // 1. Actualizar en `product.categories`
      updatedCategories = updatedCategories.map(cat => {
        if (cat.category_id === categoryId) {
          changesMade = true;
          if (updateType === 'category') {
            // Actualizar nombre y grouper de la categoría
            return { ...cat, name: newName, grouper: grouper };
          } else if (updateType === 'value' && categoryValueId) {
            // Actualizar nombre del valor dentro de la categoría
            const updatedValues = cat.values.map(val => {
              if (val.category_value_id === categoryValueId) {
                return { ...val, name: newName };
              }
              return val;
            });
            return { ...cat, values: updatedValues };
          }
        }
        return cat;
      });

      // 2. Actualizar en `product.variants`
      updatedVariants = updatedVariants.map(variant => {
        const updatedValues = variant.values.map(val => {
          if (val.categoryId === categoryId) {
            changesMade = true;
            if (updateType === 'category') {
              // Actualizar nombre de la categoría en variants.values
              return { ...val, categoryName: newName };
            } else if (updateType === 'value' && categoryValueId) {
              // Actualizar nombre del valor en variants.values
              if (val.valueId === categoryValueId) {
                return { ...val, valueName: newName };
              }
            }
          }
          return val;
        });

        // NOTA: 'categories' dentro de GeneratedVariant es un array de VariantGeneratedVariantCategoryValue
        // que solo guarda el ID y el nombre del valor, por lo que solo se actualiza si es un 'value'
        const updatedVariantCategories = variant.categories.map(vc => {
          if (
            updateType === 'value' &&
            vc.categoryValueId === categoryValueId
          ) {
            changesMade = true;
            return { ...vc, name: newName };
          }
          return vc;
        });

        return {
          ...variant,
          values: updatedValues,
          categories: updatedVariantCategories,
        };
      });

      if (changesMade) {
        product.categories = updatedCategories;
        product.variants = updatedVariants;
        await this.productsRepository.save(product);
      }
    }
  }
}
