import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('category_values')
export class CategoryValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @ManyToOne(() => Category, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_category_id' })
  parentCategory: Category;
}
