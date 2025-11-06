// src/modules/products/services/products-db.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { ProductType } from '../entities/product-type.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsDbService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(ProductType)
    private readonly productTypesRepository: Repository<ProductType>,
  ) {}

  // --------------------------------------------------------------------------------
  // Product Types
  // --------------------------------------------------------------------------------

  async getProductTypes() {
    return this.productTypesRepository.find();
  }

  async createProductType(body: CreateOrUpdateProductTypeDto) {
    const productType = new ProductType();
    productType.name = body.name;
    await this.productTypesRepository.save(productType);
    return productType;
  }

  async updateProductType(body: CreateOrUpdateProductTypeDto) {
    const productType = await this.productTypesRepository.findOne({
      where: { id: body.id },
    });
    if (!productType) throw new NotFoundException(`Product type not found`);
    productType.name = body.name;
    await this.productTypesRepository.save(productType);
    return productType;
  }

  async deleteProductType(id: string) {
    const productType = await this.productTypesRepository.findOne({
      where: { id },
    });
    if (!productType) throw new NotFoundException(`Product type not found`);
    await this.productTypesRepository.remove(productType);
  }
}
