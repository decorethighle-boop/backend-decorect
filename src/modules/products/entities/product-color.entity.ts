// src/modules/products/entities/product-color.entity.ts
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_colors')
@Unique(['product', 'code']) // the same "code" (e.g. 'black', 'marble-01') cannot be repeated for each product
export class ProductColor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, p => p.colorOptions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index()
  product: Product;

  @Column({ length: 64 })
  code: string; // logical key ('black', 'marble-01', etc.)

  @Column({ length: 120, nullable: true })
  displayName?: string; // visible name ('Negro Mate', 'Mármol 01')

  @Column({ length: 7, nullable: true })
  hexCode?: string; // optional (e.g. #000000). Useful if you want a swatch in addition to the image.

  @Column({ length: 2048 })
  imageUrl: string; // sample image (tile where the color is appreciated)

  @Column({ default: false })
  isDefault: boolean;
}
