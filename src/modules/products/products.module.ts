// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionCountry } from '../production_countries/entities/production-country.entity';
import { Supplier } from '../suppliers/entity/supplier.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { ProductsController } from './controllers/products.controller';
import { ProductType } from './entities/product-type.entity';
import { Product } from './entities/product.entity';
import { ProductsDbService } from './services/products-db.service';
import { ProductsService } from './services/products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductType,
      Wishlist,
      ProductionCountry,
      Supplier,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsDbService, ProductsService],
  exports: [ProductsDbService],
})
export class ProductsModule {}
