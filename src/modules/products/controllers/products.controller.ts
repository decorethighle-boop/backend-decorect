import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { CreateOrUpdateProductDto } from '../dto/create-or-update-product.dto';
import { CreateOrUpdateProductTypesPipe } from '../pipes/create-or-update-product-types/create-or-update-product-types.pipe';
import { CreateOrUpdateProductPipe } from '../pipes/create-or-update-product/create-or-update-product.pipe';
import { GetProductsPipe } from '../pipes/get-products/get-products.pipe';
import { ProductsService } from '../services/products.service';
import type { FilterProducts } from '../types/filter-products.type';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // --------------------------------------------------------------------------------
  // Product Types
  // --------------------------------------------------------------------------------

  @Get('product-types')
  async getProductTypes(@Res() res: Response) {
    try {
      const productTypes = await this.service.getProductTypes();
      return res.status(HttpStatus.OK).json({
        success: true,
        data: productTypes,
        message: 'Product types fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Product types fetch failed',
      });
    }
  }

  @Post('product-types')
  @UsePipes(CreateOrUpdateProductTypesPipe)
  async createProductType(
    @Body() body: CreateOrUpdateProductTypeDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.createProductType(body);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Product type created',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error creating product type',
      });
    }
  }

  @Put('product-types/:id')
  @UsePipes(CreateOrUpdateProductTypesPipe)
  async updateProductType(
    @Body() body: CreateOrUpdateProductTypeDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.updateProductType(body);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Product type updated',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error updating product type',
      });
    }
  }

  @Delete('product-types/:id')
  async deleteProductType(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.service.deleteProductType(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Product type deleted',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting product type',
      });
    }
  }

  // --------------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------------

  @Get('')
  @UsePipes(GetProductsPipe)
  async getProducts(@Query() filters: FilterProducts, @Res() res: Response) {
    try {
      const products = await this.service.getProducts(filters);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: products,
        message: 'Products fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error getting products',
      });
    }
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string, @Res() res: Response) {
    try {
      const product = await this.service.getProductById(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: product,
        message: 'Product fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error getting product',
      });
    }
  }

  @Post('')
  @UsePipes(CreateOrUpdateProductPipe)
  async createProduct(
    @Body() body: CreateOrUpdateProductDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.createProduct(body);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Product created',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error creating product',
      });
    }
  }

  @Put('/:id')
  @UsePipes(CreateOrUpdateProductPipe)
  async updateProduct(
    @Param('id') id: string,
    @Body() body: CreateOrUpdateProductDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.updateProduct({ ...body, id: id });
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Product updated',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error updating product',
      });
    }
  }

  @Delete('/:id')
  async deleteProduct(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.service.deleteProduct(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Product deleted',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting product',
      });
    }
  }
}
