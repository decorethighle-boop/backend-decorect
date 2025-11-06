import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { CreateOrUpdateProductTypesPipe } from '../pipes/create-or-update-product-types/create-or-update-product-types.pipe';
import { ProductsService } from '../services/products.service';

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
        message: '',
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
        message: '',
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
        message: '',
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
        message: '',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting product type',
      });
    }
  }
}
