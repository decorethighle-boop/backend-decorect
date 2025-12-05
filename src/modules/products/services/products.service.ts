// src/modules/products/services/products.service.ts
import { Injectable } from '@nestjs/common';

import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { CreateOrUpdateProductDto } from '../dto/create-or-update-product.dto';
import {
  GeneratedVariant,
  Product,
  ProductVariantResponse,
} from '../entities/product.entity';
import { FilterProducts } from '../types/filter-products.type';
import { FilterVariants } from '../types/filter-variant.type';
import {
  fromProductsToProductsVariantsResponse,
  ProductsVariantsResponse,
} from '../types/products-response.type';
import { ProductsDbService } from './products-db.service';

@Injectable()
export class ProductsService {
  constructor(private readonly db: ProductsDbService) {}

  async onModuleInit() {
    await this.db.ensureDefaultProductTypes();
    // await this.db.deleteAllProducts();
  }

  // --------------------------------------------------------------------------------
  // Product Types
  // --------------------------------------------------------------------------------

  async getProductTypes(user: any) {
    const shouldFilterByExistingProducts = user?.parentRole.hierarchy !== 2;

    if (shouldFilterByExistingProducts) {
      return this.db.getProductTypesWithProducts();
    }

    // Otherwise, return all product types
    return this.db.getProductTypes();
  }

  async createProductType(body: CreateOrUpdateProductTypeDto) {
    await this.db.createProductType(body);
  }

  async updateProductType(body: CreateOrUpdateProductTypeDto) {
    await this.db.updateProductType(body);
  }

  async deleteProductType(id: string) {
    await this.db.deleteProductType(id);
  }

  // --------------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------------

  async getProducts({
    page = 1,
    search,
    productTypeId,
    categoryValueId,
    user,
  }: FilterProducts) {
    const limit = 16;
    const skip = (page - 1) * limit;

    const query = await this.db.getProductsQueryBuilder();

    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (productTypeId) {
      query.andWhere('product.product_type_id = :productTypeId', {
        productTypeId,
      });
    }

    if (categoryValueId) {
      query.andWhere('product.categories @> :categoryValue', {
        categoryValue: JSON.stringify([
          { values: [{ category_value_id: categoryValueId }] },
        ]),
      });
    }

    query.take(limit).skip(skip);

    const [products, total] = await query.getManyAndCount();

    let variants: ProductsVariantsResponse[] = [];

    if (user?.parentRole.hierarchy !== 2) {
      variants = fromProductsToProductsVariantsResponse(
        products,
        categoryValueId,
      );
    } else {
      variants = products.map(p => {
        const grouperCategory = p.categories.find(cat => cat.grouper);

        if (!grouperCategory || !grouperCategory.values.length) {
          return {
            productId: p.id,
            name: p.name,
          };
        }

        const [firstValue, ...otherValues] = grouperCategory.values;

        const main_photo = firstValue.images?.main_photo || '';
        const gallery = otherValues
          .map(v => v.images?.main_photo)
          .filter(Boolean) as string[];

        return {
          productId: p.id,
          name: p.name,
          images: {
            main_photo,
            gallery,
          },
        };
      });
    }

    return {
      products: variants,
      metadata: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  async getProductById(id: string, withCategories: boolean, user?: any) {
    const product = await this.db.getProductById(id);

    if (
      !product ||
      !product.variants ||
      !product.categories ||
      (user?.parentRole.hierarchy == 2 && withCategories)
    ) {
      return product;
    }

    const usedValueIds = new Set<string>();
    product.variants.forEach(variant => {
      variant.values.forEach(val => {
        usedValueIds.add(val.valueId);
      });
    });

    product.categories = product.categories.map(category => {
      if (category.depends_on === true) {
        const filteredValues = category.values.filter(val =>
          usedValueIds.has(val.category_value_id),
        );

        return {
          ...category,
          values: filteredValues,
        };
      }

      return category;
    });

    return product;
  }

  async createProduct(body: CreateOrUpdateProductDto) {
    await this.db.createProduct(body);
  }

  async updateProduct(body: CreateOrUpdateProductDto, force: boolean) {
    await this.db.updateProduct(body, force);
  }

  async deleteProduct(id: string) {
    await this.db.deleteProduct(id);
  }

  //------------------------------------------------------------------------------
  // Product Variants
  //------------------------------------------------------------------------------

  async getVariants({
    page = 1,
    search,
    productTypeId,
    categoryValueIds,
  }: FilterVariants): Promise<ProductVariantResponse[]> {
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = await this.db.getProductsQueryBuilder();

    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (productTypeId) {
      query.andWhere('product.product_type_id = :productTypeId', {
        productTypeId,
      });
    }

    query.take(limit).skip(skip);

    const [products] = await query.getManyAndCount();

    const responses: ProductVariantResponse[] = products.map(product => {
      let filteredVariants = product.variants;

      if (categoryValueIds?.length) {
        filteredVariants = product.variants.filter(variant =>
          (categoryValueIds as string[]).every(id =>
            variant.values.some(v => v.valueId === id),
          ),
        );
      }

      return {
        id: product.id,
        name: product.name,
        variants: filteredVariants.map(variant => ({
          name: variant.name,
          mainPhoto: this.extractMainPhoto(product, variant),
          categoriyValues: variant.categories,
        })),
      };
    });

    return responses;
  }

  private extractMainPhoto(
    product: Product,
    variant: GeneratedVariant,
  ): string {
    if (!product.categories) return '';

    // 1. Obtener la categoría grouper
    const grouperCategory = product.categories.find(c => c.grouper === true);
    if (!grouperCategory) return '';

    // 2. Buscar en el variant el valor que pertenece a esa categoría
    const variantValue = variant.values.find(
      v => v.categoryId === grouperCategory.category_id,
    );
    if (!variantValue) return '';

    // 3. Buscar ese value dentro de la definición del producto
    const productCatValue = grouperCategory.values.find(
      v => v.category_value_id === variantValue.valueId,
    );
    if (!productCatValue) return '';

    // 4. Retornar su main photo
    return productCatValue.images?.main_photo ?? '';
  }
}
