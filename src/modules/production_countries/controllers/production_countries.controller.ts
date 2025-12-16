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
import { CreateOrUpdateProductionCountryDto } from '../dto/create_or_edit_production_country.dto';
import { CreateOrUpdateProductionCountryPipe } from '../pipes/create-or-update-production-country/create-or-update-production-country.pipe';
import { GetProductionCountriesPipe } from '../pipes/get-production-countries/get-production-countries.pipe';
import { ProductionCountryService } from '../services/production_countries.service';
import { type FilterProductionCountries } from '../types/filter-production-countries';

@Controller('production-countries')
export class ProductionCountriesController {
  constructor(private readonly service: ProductionCountryService) {}

  @Get('')
  @UsePipes(GetProductionCountriesPipe)
  async getProductionCountries(
    @Query() filters: FilterProductionCountries,
    @Res() res: Response,
  ) {
    try {
      const productionCountries =
        await this.service.getProductionCountries(filters);
      return res.status(200).json({
        success: true,
        data: productionCountries,
        message: 'Production countries fetched',
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        data: null,
        message: error.message || 'Error getting production countries',
      });
    }
  }

  @Post('')
  @UsePipes(CreateOrUpdateProductionCountryPipe)
  async createProductionCountry(
    @Body() body: CreateOrUpdateProductionCountryDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.createProductionCountry(body);
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Production country created',
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        data: null,
        message: error.message || 'Error creating production country',
      });
    }
  }

  @Put('/:id')
  @UsePipes(CreateOrUpdateProductionCountryPipe)
  async updateProductionCountry(
    @Param('id') id: string,
    @Body() body: CreateOrUpdateProductionCountryDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.updateProductionCountry({ ...body, id });
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Production country updated',
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        data: null,
        message: error.message || 'Error updating production country',
      });
    }
  }

  @Delete('/:id')
  async deleteProductionCountry(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.service.deleteProductionCountry(id);
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Production country deleted',
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting production country',
      });
    }
  }
}
