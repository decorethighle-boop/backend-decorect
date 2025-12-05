import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RangeGroup } from './ranges-group.entity';

@Entity('ranges')
export class ProductsRange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'image_banner', type: 'text', nullable: false })
  imageBanner: string;

  @Column({ type: 'text', array: true, nullable: true })
  images: string[];

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'jsonb', nullable: false })
  variants: ProductRangeVariant[];

  @ManyToOne(() => RangeGroup, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: RangeGroup;
}

export interface ProductRangeVariant {
  productId: string;
  productName: string;
  variantName: string;
  mainPhoto: string;
  selectedCategoryValueIds: string[];
}

export interface RangeGroupResponse {
  id: string;
  name: string;
  ranges: RangeResponse[];
}

export interface RangeResponse {
  id: string;
  name: string;
  imageBanner: string;
}
