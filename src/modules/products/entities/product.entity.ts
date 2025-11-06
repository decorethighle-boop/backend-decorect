import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CategoryValue } from 'src/modules/categories/entities/category-value.entity';
import { ColorProductImage } from './product-color.entity';
import { ProductType } from './product-type.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @ManyToOne(() => ProductType, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @Column({ name: 'main_photo', nullable: true })
  mainPhoto: string;

  @Column('text', { array: true, name: 'presentation_photos', nullable: true })
  presentationPhotos: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => CategoryValue, { cascade: true })
  @JoinTable({
    name: 'product_sub_categories',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'category_value_id' },
  })
  subCategories: CategoryValue[];

  @OneToMany(() => ColorProductImage, image => image.product, {
    cascade: true,
  })
  colorImages: ColorProductImage[];

  @Column({ default: false })
  rectified: boolean;

  @Column({ name: 'anti_slip', default: false })
  antiSlip: boolean;

  @Column({ length: 120, name: 'production_country', nullable: true })
  productionCountry: string;
}
