// src/modules/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from '../products/entities/product-type.entity';
import { Product } from '../products/entities/product.entity';
import { CategoriesController } from './controllers/categories.controller';
import { CategoryValue } from './entities/category-value.entity';
import { Category } from './entities/category.entity';
import { CategoriesDbService } from './services/categories-db.service';
import { CategoriesService } from './services/categories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, CategoryValue, ProductType]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesDbService, CategoriesService],
  exports: [CategoriesDbService],
})
export class CategoriesModule {}
