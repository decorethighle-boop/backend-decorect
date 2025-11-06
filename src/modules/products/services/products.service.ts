// src/modules/products/services/products.service.ts
import { Injectable } from '@nestjs/common';

import { ProductsDbService } from './products-db.service';

@Injectable()
export class ProductsService {
  constructor(private readonly db: ProductsDbService) {}
}
