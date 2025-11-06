import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_types')
export class ProductType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;
}
