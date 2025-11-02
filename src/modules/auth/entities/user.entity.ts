import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ParentRole } from './parent-role.entity';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clerk_user_id', type: 'varchar', length: 255, unique: true })
  clerkUserId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 250, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @ManyToOne(() => Role, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => ParentRole, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'parent_role_id' })
  parentRole: ParentRole;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
