import { ParentRole, Role } from '../entities';

export interface JwtPayload {
  sub: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  email: string;
  role?: Role;
  parentRole: ParentRole;
  createdAt: Date;
  expiresIn: number;
}

export function createJwtPayload(
  payload: Omit<JwtPayload, 'createdAt' | 'expiresIn'> & {
    createdAt?: Date;
    expiresIn?: number;
  },
): JwtPayload {
  return {
    ...payload,
    createdAt: payload.createdAt || new Date(),
    expiresIn: payload.expiresIn || 7 * 24 * 60 * 60,
  };
}
