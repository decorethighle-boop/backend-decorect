// src/modules/products/controllers/products.controller.ts
import { Controller } from '@nestjs/common';
import { ProductsDbService } from '../services/products-db.service';
import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
    private readonly db: ProductsDbService,
  ) {}
}
