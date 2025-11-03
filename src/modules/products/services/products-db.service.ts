// src/modules/products/services/products-db.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductColor } from '../entities/product-color.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsDbService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductColor)
    private readonly colors: Repository<ProductColor>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findCategoriesByIds(ids: string[]) {
    return this.categories.find({
      where: { id: In(ids) },
      relations: ['parent'],
    });
  }

  saveProduct(p: Product) {
    return this.products.save(p);
  }

  async upsertColors(product: Product, input: Array<Partial<ProductColor>>) {
    const entities = input.map(c => this.colors.create({ ...c, product }));
    await this.colors.save(entities);
    return this.colors.find({ where: { product: { id: product.id } } });
  }

  findProductById(id: string) {
    return this.products.findOne({
      where: { id },
      relations: { subcategories: { parent: true }, colorOptions: true },
    });
  }
}
