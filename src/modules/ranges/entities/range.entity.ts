import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ranges')
export class ProductsRange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'image_banner', type: 'text', nullable: true })
  imageBanner: string;

  @Column({ type: 'jsonb', nullable: false })
  images: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'book_match', default: false })
  bookMatch: boolean;

  @Column({ type: 'jsonb', nullable: false })
  variants: ProductRangeVariant[];
}

export interface ProductRangeVariant {
  productId: string;
  values: {
    variantName: string;
  }[];
}
