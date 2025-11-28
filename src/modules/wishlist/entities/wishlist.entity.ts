import { User } from 'src/modules/auth/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface WishlistProductVariant {
  productId: string;
  variantName: string;
  selectedCategoryValueIds: string[];
}

@Entity('wishlist')
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb', nullable: false })
  products: WishlistProductVariant[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

export interface WishlistResponse {
  id: string;
  name: string;
  products: WishlistProduct[];
}

export interface WishlistProduct {
  productId: string;
  productName: string;
  variantName: string;
  categoryValues: WhislistCategoryValue[];
}

export interface WhislistCategoryValue {
  category_value_id: string;
  name: string;
  grouper: boolean;
  images?: {
    main_photo: string;
    gallery: string[];
  };
}
