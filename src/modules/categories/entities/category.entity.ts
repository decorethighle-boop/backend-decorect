import { ProductType } from 'src/modules/products/entities/product-type.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @ManyToOne(() => ProductType, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @Column({ type: 'boolean', default: false })
  grouper: boolean;
}
