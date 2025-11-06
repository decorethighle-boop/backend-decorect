import { CategoryValue } from 'src/modules/categories/entities/category-value.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('color_product_images')
export class ColorProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => CategoryValue, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_value_id' })
  categoryValue: CategoryValue;

  @Column({ type: 'text' })
  image: string;

  @Column({ default: false })
  default: boolean;
}
