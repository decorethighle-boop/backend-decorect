// src/modules/products/services/products-db.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsDbService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,

    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}
}
