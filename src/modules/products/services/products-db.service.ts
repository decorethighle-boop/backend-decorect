// src/modules/products/services/products-db.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { CreateOrUpdateProductDto } from '../dto/create-or-update-product.dto';
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

  async ensureDefaultProductTypes() {
    const defaultProductTypes = ['Tile'];

    for (const name of defaultProductTypes) {
      const exists = await this.productTypesRepository.findOne({
        where: { name },
      });
      if (!exists) {
        const productType = this.productTypesRepository.create({
          name,
        });
        await this.productTypesRepository.save(productType);
      }
    }
  }

  async getProductTypes() {
    return this.productTypesRepository.find();
  }

  async createProductType(body: CreateOrUpdateProductTypeDto) {
    const productType = new ProductType();
    productType.id = body.id;
    productType.name = body.name;
    await this.productTypesRepository.save(productType);
  }

  async updateProductType(body: CreateOrUpdateProductTypeDto) {
    const productType = await this.productTypesRepository.findOne({
      where: { id: body.id },
    });
    if (!productType) throw new NotFoundException(`Product type not found`);
    productType.name = body.name;
    await this.productTypesRepository.save(productType);
  }

  async deleteProductType(id: string) {
    const productType = await this.productTypesRepository.findOne({
      where: { id },
    });
    if (!productType) throw new NotFoundException(`Product type not found`);
    await this.productTypesRepository.remove(productType);
  }

  // --------------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------------

  async getProductsQueryBuilder() {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productType', 'productType');
  }

  async getProductById(id: string) {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['productType'],
    });
  }

  async createProduct(body: CreateOrUpdateProductDto) {
    const existingProduct = await this.productsRepository.findOne({
      where: { id: body.id },
    });

    if (existingProduct) {
      throw new ConflictException(`Product already exists`);
    }

    const productType = await this.productTypesRepository.findOne({
      where: { id: body.productTypeId },
    });

    if (!productType) {
      throw new NotFoundException(`ProductType  not found`);
    }

    const product = this.productsRepository.create({
      id: body.id,
      name: body.name,
      productType: productType,
      description: body.description,
      productionCountry: body.productionCountry,
      categories: body.categories.map(cat => ({
        ...cat,
        depends_on: cat.depends_on ?? false,
        grouper: cat.grouper ?? false,
      })),
    });

    await this.productsRepository.save(product);
  }

  async updateProduct(body: CreateOrUpdateProductDto) {
    const product = await this.productsRepository.findOne({
      where: { id: body.id },
    });
    if (!product) throw new NotFoundException(`Product not found`);
    product.name = body.name;
    product.description = body.description;
    product.productionCountry = body.productionCountry;
    product.categories = body.categories.map(cat => ({
      ...cat,
      depends_on: cat.depends_on ?? false,
      grouper: cat.grouper ?? false,
    }));
    await this.productsRepository.save(product);
  }

  async deleteProduct(id: string) {
    const product = await this.productsRepository.findOne({
      where: { id },
    });
    if (!product) throw new NotFoundException(`Product not found`);
    await this.productsRepository.remove(product);
  }

  async deleteAllProducts() {
    await this.productsRepository.deleteAll();
  }
}
