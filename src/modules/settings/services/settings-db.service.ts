import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsDataUnion } from '../dto/update-settings.dto';
import { Settings, SettingsType } from '../entities/settings.entity';

@Injectable()
export class SettingsDbService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  /* ================= CREATE ================= */

  async create(type: SettingsType) {
    const exists = await this.settingsRepository.findOne({ where: { type } });

    if (exists) return;

    const settings = this.settingsRepository.create({
      type,
      data: {},
    });

    return this.settingsRepository.save(settings);
  }

  /* ================= READ ================= */
  async getAll() {
    return this.settingsRepository.find();
  }

  async get(type: SettingsType) {
    const settings = await this.settingsRepository.findOne({
      where: { type },
    });

    if (!settings) {
      throw new NotFoundException(`Settings ${type} not found`);
    }

    return settings;
  }

  /* ================= UPDATE ================= */

  async update(type: SettingsType, data: SettingsDataUnion) {
    const settings = await this.settingsRepository.findOne({
      where: { type },
    });

    if (!settings) {
      throw new NotFoundException(`Settings ${type} not found`);
    }

    settings.data = data;

    return this.settingsRepository.save(settings);
  }

  /* ================= DELETE ================= */

  async clear(type: SettingsType) {
    const settings = await this.settingsRepository.findOne({
      where: { type },
    });

    if (!settings) {
      throw new NotFoundException(`Settings ${type} not found`);
    }

    settings.data = {};
    return this.settingsRepository.save(settings);
  }
}
