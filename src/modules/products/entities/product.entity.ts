import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductType } from './product-type.entity';

interface VariantCompatibility {
  [categoryName: string]: string[];
}

interface VariantCategoryValue {
  category_value_id: string;
  name: string;
  images?: {
    main_photo: string;
    gallery: string[];
  };
  rules?: VariantCompatibility;
}

interface VariantCategory {
  category_id: string;
  name: string;
  grouper?: boolean;
  depends_on: boolean;
  values: VariantCategoryValue[];
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @ManyToOne(() => ProductType, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 120, name: 'production_country', nullable: true })
  productionCountry: string;

  @Column({ type: 'jsonb', nullable: false })
  categories: VariantCategory[];
}
