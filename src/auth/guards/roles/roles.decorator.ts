import { HttpStatus, SetMetadata } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';

export const ROLES_KEY = 'role';
export const RolesDecorator = (...role: Roles[]) =>
  SetMetadata(ROLES_KEY, role);

export enum Roles {
  All = 'All',
  Admin = 'Admin',
  User = 'User',
}

export const RoleHierarchy = {
  All: 3,
  Admin: 2,
  User: 1,
};

export function FromRoleToHierarchy(role: Roles) {
  return RoleHierarchy[role];
}

export function FromHierarchyToRole(hierarchy: number) {
  for (const role in RoleHierarchy) {
    if (RoleHierarchy[role] === hierarchy) {
      return role as Roles;
    }
  }
  throw new CustomHttpException(
    'Invalid role hierarchy',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
