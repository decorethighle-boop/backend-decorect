import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('production_countries')
export class ProductionCountry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  code: string | null;
}
