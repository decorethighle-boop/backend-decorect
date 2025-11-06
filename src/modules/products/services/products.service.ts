// src/modules/products/services/products.service.ts
import { Injectable } from '@nestjs/common';

import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { ProductsDbService } from './products-db.service';

@Injectable()
export class ProductsService {
  constructor(private readonly db: ProductsDbService) {}

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
}
