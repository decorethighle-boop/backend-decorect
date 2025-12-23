import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateOrUpdateSupplierDto } from '../dto/creater-or-update-supplier.dto';
import { CreateOrUpdateSupplierPipe } from '../pipes/create-or-update-supplier/create-or-update-supplier.pipe';
import { GetSuppliersPipe } from '../pipes/get-suppliers/get-suppliers.pipe';
import { SuppliersService } from '../services/suppliers.service';
import { type FilterSuppliers } from '../types/filter-suppliers.type';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get('')
  @UsePipes(GetSuppliersPipe)
  async getSuppliers(@Query() filters: FilterSuppliers, @Res() res: Response) {
    try {
      const suppliers = await this.service.getSuppliers(filters);
      return res.status(200).json({
        success: true,
        data: suppliers,
        message: 'Suppliers fetched',
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        data: null,
        message: error.message || 'Error getting suppliers',
      });
    }
  }

  @Post('')
  @UsePipes(CreateOrUpdateSupplierPipe)
  async createSupplier(
    @Body() body: CreateOrUpdateSupplierDto,
    @Res() res: Response,
  ) {
    try {
      const supplier = await this.service.createSupplier(body);
      return res.status(200).json({
        success: true,
        data: supplier,
        message: 'Supplier created',
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        data: null,
        message: error.message || 'Error creating supplier',
      });
    }
  }

  @Put('/:id')
  @UsePipes(CreateOrUpdateSupplierPipe)
  async updateSupplier(
    @Param('id') id: string,
    @Body() body: CreateOrUpdateSupplierDto,
    @Res() res: Response,
  ) {
    try {
      const supplier = await this.service.updateSupplier({ ...body, id: id });
      return res.status(200).json({
        success: true,
        data: supplier,
        message: 'Supplier updated',
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        data: null,
        message: error.message || 'Error updating supplier',
      });
    }
  }

  @Delete('/:id')
  async deleteSupplier(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.service.deleteSupplier(id);
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Supplier deleted',
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting supplier',
      });
    }
  }
}
