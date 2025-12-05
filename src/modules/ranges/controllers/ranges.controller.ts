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
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateOrUpdateProductsRangeDto } from '../dto/create-or-update-range.dto';
import { CreateOrUpdateRangeGroupDto } from '../dto/create-or-update-reange-group.dto';

import { RangesService } from '../services/ranges.service';
import { type FilterRangeGroups } from '../types/filter-range-groups';
import { type FilterRanges } from '../types/filter-ranges';

@Controller('ranges')
export class RangesController {
  constructor(private readonly service: RangesService) {}

  //------------------------------------------------------------------------------
  // Range Groups
  //------------------------------------------------------------------------------

  @Get('groups')
  async getRangeGroups(
    @Query() filters: FilterRangeGroups,
    @Res() res: Response,
  ) {
    try {
      const rangeGroups = await this.service.getRangeGroups(filters);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: rangeGroups,
        message: 'Range groups fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error fetching Range groups',
      });
    }
  }

  @Post('groups')
  async createRangeGroup(
    @Body() body: CreateOrUpdateRangeGroupDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.createRangeGroup(body);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Range group created',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error creating Range group',
      });
    }
  }

  @Put('groups/:id')
  async updateRangeGroup(
    @Param('id') id: string,
    @Body() body: CreateOrUpdateRangeGroupDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.updateRangeGroup({ ...body, id });
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Range group updated',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error updating Range group',
      });
    }
  }

  @Delete('groups/:id')
  async deleteRangeGroup(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.service.deleteRangeGroup(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Range group deleted',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting Range group',
      });
    }
  }

  //------------------------------------------------------------------------------
  // Ranges
  //------------------------------------------------------------------------------
  @Get()
  async getRanges(
    @Query() filters: FilterRanges,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const ranges = await this.service.getRanges(filters, req['user']);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: ranges,
        message: 'Ranges fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error fetching Ranges',
      });
    }
  }

  @Get(':id')
  async getRange(@Param('id') id: string, @Res() res: Response) {
    try {
      const range = await this.service.getRangeById(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: range,
        message: 'Range fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error fetching Range',
      });
    }
  }

  @Post()
  async createRange(
    @Body() body: CreateOrUpdateProductsRangeDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.createRange(body);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Range created',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error creating Range',
      });
    }
  }

  @Put(':id')
  async updateRange(
    @Param('id') id: string,
    @Body() body: CreateOrUpdateProductsRangeDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.updateRange({ ...body, id });
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Range updated',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error updating Range',
      });
    }
  }

  @Delete(':id')
  async deleteRange(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.service.deleteRange(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Range deleted',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting Range',
      });
    }
  }
}
