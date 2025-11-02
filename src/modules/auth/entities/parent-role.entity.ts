import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'parent_roles' })
export class ParentRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'int' })
  hierarchy: number;
}

export function convertParentRoleToRole(parentRole: ParentRole): Role {
  const role = new Role();
  role.id = parentRole.id;
  role.name = parentRole.name;
  role.parentRole = parentRole;
  role.permissions = [];
  return role;
}
