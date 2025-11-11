// src/modules/products/services/products.service.ts
import { Injectable } from '@nestjs/common';

import { CategoriesDbService } from 'src/modules/categories/services/categories-db.service';
import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { CreateOrUpdateProductDto } from '../dto/create-or-update-product.dto';
import { FilterProducts } from '../types/filter-products.type';
import { ProductsDbService } from './products-db.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly db: ProductsDbService,
    private readonly categoryDb: CategoriesDbService,
  ) {}

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
    return this.db.createProductType(body);
  }

  async updateProductType(body: CreateOrUpdateProductTypeDto) {
    return this.db.updateProductType(body);
  }

  async deleteProductType(id: string) {
    return this.db.deleteProductType(id);
  }

  // --------------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------------

  async getProducts({
    page = 1,
    search,
    productTypeId,
    subCategoryId,
  }: FilterProducts) {
    const limit = 18;
    const skip = (page - 1) * limit;

    const query = await this.db.getProductsQueryBuilder();
    query.take(limit).skip(skip);

    query.andWhere('product.productType = :productTypeId', {
      productTypeId,
    });

    if (search) {
      query.andWhere('(product.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (subCategoryId) {
      const catValue =
        await this.categoryDb.findCategoryValueById(subCategoryId);

      if (catValue && catValue.parentCategory?.name === 'Color') {
        query
          .leftJoin('product.colorImages', 'colorImage')
          .leftJoin('colorImage.categoryValue', 'colorCategoryValue')
          .andWhere('colorCategoryValue.id = :subCategoryId', {
            subCategoryId,
          });
      } else {
        query
          .leftJoin('product.subCategories', 'subCategory')
          .andWhere('subCategory.id = :subCategoryId', { subCategoryId });
      }
    }

    const [products, total] = await query.getManyAndCount();
    return {
      products,
      metadata: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  async createProduct(body: CreateOrUpdateProductDto) {
    await this.db.createProduct(body);
  }
}
