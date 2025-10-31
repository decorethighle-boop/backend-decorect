// src/modules/products/controllers/products.controller.ts
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductsDbService } from '../services/products-db.service';
import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
    private readonly db: ProductsDbService,
  ) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.db.findProductById(id);
  }
}
