import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Put,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { UpdateSettingsDto } from '../dto/update-settings.dto';
import { SettingsType } from '../entities/settings.entity';
import { SettingsService } from '../services/settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('')
  async getSettings(@Res() res: Response) {
    try {
      const settings = await this.service.getAll();
      return res.status(HttpStatus.OK).json({
        success: true,
        data: settings,
        message: 'Settings fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Settings fetch failed',
      });
    }
  }

  @Get('/:type')
  async getSettingsByType(
    @Param('type', new ParseEnumPipe(SettingsType)) type: SettingsType,
    @Res() res: Response,
  ) {
    try {
      const settings = await this.service.get(type);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: settings,
        message: 'Settings fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Settings fetch failed',
      });
    }
  }

  @Put('')
  async updateSettings(@Res() res: Response, @Body() body: UpdateSettingsDto) {
    try {
      const settings = await this.service.update(body.data);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: settings,
        message: 'Settings updated',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Settings update failed',
      });
    }
  }

  @Delete('/:type')
  async clearSettings(
    @Param('type', new ParseEnumPipe(SettingsType)) type: SettingsType,
    @Res() res: Response,
  ) {
    try {
      await this.service.clear(type);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Settings cleared',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Settings clear failed',
      });
    }
  }
}
