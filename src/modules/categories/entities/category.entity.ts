// src/modules/categories/entities/category.entity.ts
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index(['parent', 'name'], { unique: true })
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 140 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  iconUrl: string | null;

  @Column({ nullable: true })
  imageUrl: string | null;

  @ManyToOne(() => Category, c => c.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Category | null;

  @OneToMany(() => Category, c => c.parent)
  children: Category[];
}
