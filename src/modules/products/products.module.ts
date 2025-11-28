// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './controllers/products.controller';
import { ProductType } from './entities/product-type.entity';
import { Product } from './entities/product.entity';
import { ProductsDbService } from './services/products-db.service';
import { ProductsService } from './services/products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductType])],
  controllers: [ProductsController],
  providers: [ProductsDbService, ProductsService],
  exports: [ProductsDbService],
})
export class ProductsModule {}
