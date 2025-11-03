// src/modules/products/services/products.service.ts
import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { ProductsDbService } from './products-db.service';

@Injectable()
export class ProductsService {
  constructor(private readonly db: ProductsDbService) {}

  async create(dto: CreateProductDto) {
    const cats = await this.db.findCategoriesByIds(dto.subcategoryIds);
    if (cats.length !== dto.subcategoryIds.length) {
      throw new CustomHttpException(
        'Some subcategory IDs do not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    // validate that all are children
    if (cats.some(c => !c.parent)) {
      throw new CustomHttpException(
        'Assign only subcategories (categories with a parent).',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const p = new Product();
    p.name = dto.name;
    p.type = dto.type;
    p.description = dto.description ?? null;
    p.mainImageUrl = dto.mainImageUrl ?? null;
    p.presentationImageUrl = dto.presentationImageUrl ?? null;
    p.countryOfOrigin = dto.countryOfOrigin.toUpperCase();
    p.subcategories = cats;

    const saved = await this.db.saveProduct(p);

    if (dto.colorOptions?.length) {
      await this.db.upsertColors(saved, dto.colorOptions);
      return this.db.findProductById(saved.id);
    }
    return saved;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.db.findProductById(id);
    if (!existing)
      throw new CustomHttpException('Product not found', HttpStatus.NOT_FOUND);

    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.type !== undefined) existing.type = dto.type;
    if (dto.description !== undefined)
      existing.description = dto.description ?? null;
    if (dto.mainImageUrl !== undefined)
      existing.mainImageUrl = dto.mainImageUrl ?? null;
    if (dto.presentationImageUrl !== undefined)
      existing.presentationImageUrl = dto.presentationImageUrl ?? null;
    if (dto.countryOfOrigin !== undefined)
      existing.countryOfOrigin = dto.countryOfOrigin.toUpperCase();

    if (dto.subcategoryIds) {
      const cats = await this.db.findCategoriesByIds(dto.subcategoryIds);
      if (
        cats.length !== dto.subcategoryIds.length ||
        cats.some(c => !c.parent)
      ) {
        throw new CustomHttpException(
          'Assign only valid subcategories.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      existing.subcategories = cats;
    }

    const saved = await this.db.saveProduct(existing);

    if (dto.colorOptions) {
      await this.db.upsertColors(saved, dto.colorOptions);
    }
    return this.db.findProductById(saved.id);
  }
}
