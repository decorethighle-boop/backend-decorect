import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import {
  isHomePageData,
  isInfoData,
  isProductTypeData,
  isRangesData,
  isSettingsData,
  isWishlistData,
  SettingsDataUnion,
} from '../dto/update-settings.dto';
import { SettingsType } from '../entities/settings.entity';
import { SettingsDbService } from './settings-db.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly settingsDbService: SettingsDbService) {}

  async onModuleInit() {
    const types = Object.values(SettingsType);

    for (const type of types) {
      await this.settingsDbService.create(type);
    }
  }

  async getAll() {
    return this.settingsDbService.getAll();
  }

  async get(type: SettingsType) {
    return this.settingsDbService.get(type);
  }

  async update(data: SettingsDataUnion) {
    let type: SettingsType;

    if (isHomePageData(data)) {
      type = SettingsType.HOMEPAGE;
    } else if (isInfoData(data)) {
      type = SettingsType.INFO;
    } else if (isSettingsData(data)) {
      type = SettingsType.SETTINGS;
    } else if (isWishlistData(data)) {
      type = SettingsType.WHISHLIST;
    } else if (isRangesData(data)) {
      type = SettingsType.RANGES;
    } else if (isProductTypeData(data)) {
      type = SettingsType.PRODUCTTYPE;
    } else {
      throw new BadRequestException('Invalid settings data type');
    }

    return this.settingsDbService.update(type, data);
  }

  async clear(type: SettingsType) {
    return this.settingsDbService.clear(type);
  }
}
