// src/modules/products/services/products-db.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryValue } from 'src/modules/categories/entities/category-value.entity';
import { In, Repository } from 'typeorm';
import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { CreateOrUpdateProductDto } from '../dto/create-or-update-product.dto';
import { ColorProductImage } from '../entities/product-color.entity';
import { ProductType } from '../entities/product-type.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsDbService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(ProductType)
    private readonly productTypesRepository: Repository<ProductType>,

    @InjectRepository(CategoryValue)
    private readonly categoryValuesRepository: Repository<CategoryValue>,

    @InjectRepository(ColorProductImage)
    private readonly colorImageRepository: Repository<ColorProductImage>,
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

  // --------------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------------

  async getProductsQueryBuilder() {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productType', 'productType')
      .leftJoinAndSelect('product.subCategories', 'subCategories')
      .leftJoinAndSelect('product.colorImages', 'colorImages');
  }

  async createProduct(body: CreateOrUpdateProductDto) {
    const {
      id,
      name,
      productTypeId,
      mainPhoto,
      presentationPhotos,
      description,
      subCategories,
      colorImages,
      rectified,
      antiSlip,
      productionCountry,
    } = body;

    const existingProduct = await this.productsRepository.findOne({
      where: { name },
    });
    if (existingProduct) {
      throw new ConflictException('Product already exists');
    }

    const productType = await this.productTypesRepository.findOne({
      where: { id: productTypeId },
    });
    if (!productType) {
      throw new NotFoundException('Product type not found');
    }

    let subCategoryEntities: CategoryValue[] = [];
    if (subCategories?.length) {
      subCategoryEntities = await this.categoryValuesRepository.find({
        where: { id: In(subCategories) },
      });
      if (subCategoryEntities.length !== subCategories.length) {
        throw new NotFoundException('One or more subCategories not found');
      }
    }

    const product = this.productsRepository.create({
      id,
      name,
      productType,
      mainPhoto,
      presentationPhotos,
      description,
      subCategories: subCategoryEntities,
      rectified,
      antiSlip,
      productionCountry,
    });

    const savedProduct = await this.productsRepository.save(product);

    if (colorImages?.length) {
      const colorImageEntities: ColorProductImage[] = [];

      for (const colorImageDto of colorImages) {
        const { categoryValueId, image, default: isDefault } = colorImageDto;

        const categoryValue = await this.categoryValuesRepository.findOne({
          where: { id: categoryValueId },
        });
        if (!categoryValue) {
          throw new NotFoundException(
            `CategoryValue with id ${categoryValueId} not found`,
          );
        }

        const colorImage = this.colorImageRepository.create({
          product: savedProduct,
          categoryValue,
          image,
          default: isDefault ?? false,
        });

        colorImageEntities.push(colorImage);
      }

      await this.colorImageRepository.save(colorImageEntities);
    }
  }
}
