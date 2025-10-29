import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'parent_roles' })
export class ParentRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'int' })
  hierarchy: number;
}
