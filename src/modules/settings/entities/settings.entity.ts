import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SettingsType {
  INFO = 'info',
  SETTINGS = 'settings',
  HOMEPAGE = 'homepage',
  WHISHLIST = 'whishlist',
  RANGES = 'ranges',
  PRODUCTTYPE = 'producttype',
  PRODUCTSMENU = 'productsmenu',
}

@Entity('settings')
export class Settings {
  @PrimaryColumn({
    type: 'enum',
    enum: SettingsType,
  })
  type: SettingsType;

  @Column({ type: 'jsonb', nullable: false })
  data: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
