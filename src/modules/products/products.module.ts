// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryValue } from '../categories/entities/category-value.entity';
import { Category } from '../categories/entities/category.entity';
import { CategoriesDbService } from '../categories/services/categories-db.service';
import { ProductsController } from './controllers/products.controller';
import { ProductType } from './entities/product-type.entity';
import { Product } from './entities/product.entity';
import { ProductsDbService } from './services/products-db.service';
import { ProductsService } from './services/products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductType, CategoryValue, Category]),
  ],
  controllers: [ProductsController],
  providers: [ProductsDbService, ProductsService, CategoriesDbService],
})
export class ProductsModule {}
