import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('range_groups')
export class RangeGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;
}
