// src/modules/products/entities/product.entity.ts
import {
  Check,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductColor } from './product-color.entity';

export enum ProductType {
  GENERIC = 'GENERIC',
  TILE = 'TILE',
  SERVICE = 'SERVICE',
}

@Entity('products')
@Check(`char_length("countryOfOrigin") = 2`) // ISO-3166 alpha-2 Example: 'US', 'CA', 'ES'
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 180 })
  name: string;

  @Column({ type: 'enum', enum: ProductType, default: ProductType.GENERIC })
  type: ProductType;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  // URLs through CDN: the backend does NOT process images
  @Column({ length: 2048, nullable: true })
  mainImageUrl?: string | null;

  @Column({ length: 2048, nullable: true })
  presentationImageUrl?: string | null;

  @Column({ length: 2 }) // EJ: 'US', 'CA', 'ES' (uppercase en DTO)
  countryOfOrigin: string;

  // Only subcategories are allowed (categories with parent != null)
  @ManyToMany(() => Category)
  @JoinTable({
    name: 'product_subcategories',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'category_id' },
  })
  subcategories: Category[];

  @OneToMany(() => ProductColor, c => c.product, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  colorOptions: ProductColor[];
}
