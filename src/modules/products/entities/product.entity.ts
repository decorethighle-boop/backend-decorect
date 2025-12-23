import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Supplier } from 'src/modules/suppliers/entity/supplier.entity';
import { ProductionCountry } from '../../production_countries/entities/production-country.entity';
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
  canSelect: boolean;
  grouper?: boolean;
  depends_on: boolean;
  values: VariantCategoryValue[];
}

export interface GeneratedVariant {
  name: string;
  sku?: string;
  inAWishlist: boolean;
  values: {
    categoryId: string;
    categoryName: string;
    valueId: string;
    valueName: string;
  }[];
  categories: VariantGeneratedVariantCategoryValue[];
}

export interface VariantGeneratedVariantCategoryValue {
  categoryValueId: string;
  name: string;
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150, unique: true })
  name: string;

  @ManyToOne(() => ProductType, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => ProductionCountry, { nullable: false, eager: true })
  @JoinColumn({ name: 'production_country_id' })
  productionCountry: ProductionCountry;

  @ManyToOne(() => Supplier, { nullable: false, eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ type: 'jsonb', nullable: false })
  categories: VariantCategory[];

  @Column({ type: 'jsonb', nullable: false })
  variants: GeneratedVariant[];
}

export interface ProductVariantResponse {
  id: string;
  name: string;
  variants: VariantsResponse[];
}

export interface VariantsResponse {
  name: string;
  mainPhoto: string;
  categoriyValues: VariantGeneratedVariantCategoryValue[];
}
