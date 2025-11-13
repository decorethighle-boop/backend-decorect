// src/modules/products/services/products.service.ts
import { Injectable } from '@nestjs/common';

import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { CreateOrUpdateProductDto } from '../dto/create-or-update-product.dto';
import { FilterProducts } from '../types/filter-products.type';
import { fromProductsToProductsVariantsResponse } from '../types/products-response.type';
import { ProductsDbService } from './products-db.service';

@Injectable()
export class ProductsService {
  constructor(private readonly db: ProductsDbService) {}

  async onModuleInit() {
    await this.db.ensureDefaultProductTypes();
  }

  // --------------------------------------------------------------------------------
  // Product Types
  // --------------------------------------------------------------------------------

  async getProductTypes() {
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

    const variants = fromProductsToProductsVariantsResponse(
      products,
      categoryValueId,
    );
    return {
      variants,
      metadata: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  async getProductById(id: string) {
    return this.db.getProductById(id);
  }

  async createProduct(body: CreateOrUpdateProductDto) {
    await this.db.createProduct(body);
  }

  async updateProduct(body: CreateOrUpdateProductDto) {
    await this.db.updateProduct(body);
  }

  async deleteProduct(id: string) {
    await this.db.deleteProduct(id);
  }
}
