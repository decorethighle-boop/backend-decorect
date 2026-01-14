import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './controllers/settings.controller';
import { Settings } from './entities/settings.entity';
import { SettingsDbService } from './services/settings-db.service';
import { SettingsService } from './services/settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  controllers: [SettingsController],
  providers: [SettingsDbService, SettingsService],
  exports: [SettingsDbService],
})
export class SettingsModule {}
