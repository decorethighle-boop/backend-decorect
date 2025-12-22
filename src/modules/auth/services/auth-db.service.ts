import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ParentRole, Permission, Role, User } from '../entities';

@Injectable()
export class AuthDbService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(ParentRole)
    private readonly parentRoleRepository: Repository<ParentRole>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // ---------------------------------------------------------------------------
  // USERS
  // ---------------------------------------------------------------------------

  async findUserByClerkId(clerkUserId: string) {
    const user = await this.userRepository.findOne({
      where: { clerkUserId },
      relations: ['parentRole', 'role', 'role.parentRole', 'role.permissions'],
    });

    if (!user) return null;

    return {
      ...user,
      parentRole: user.role?.parentRole ?? user.parentRole,
    };
  }
  async findUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['parentRole', 'role', 'role.parentRole', 'role.permissions'],
    });

    if (!user) return null;

    return {
      ...user,
      parentRole: user.role?.parentRole ?? user.parentRole,
    };
  }

  async saveUser(user: User) {
    this.userRepository.save(user);
  }

  async deleteUserById(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new InternalServerErrorException('User not found');
    this.userRepository.remove(user);
  }

  async getUsersQueryBuilder() {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.parentRole', 'parentRole')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.imageUrl',
        'user.email',
        'user.created_at',
        'role',
        'parentRole',
      ]);
  }

  async addRoleToUser(userId: string, roleId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'parentRole'],
    });

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['parentRole'],
    });

    if (role) {
      user.role = role;
      user.parentRole = role.parentRole;

      await this.userRepository.save(user);
      return;
    }

    const parentRole = await this.parentRoleRepository.findOne({
      where: { id: roleId },
    });

    if (parentRole) {
      user.parentRole = parentRole;
      user.role = null;

      await this.userRepository.save(user);
      return;
    }

    throw new InternalServerErrorException('Role or ParentRole not found');
  }

  // ---------------------------------------------------------------------------
  // ROLES & PERMISSIONS
  // ---------------------------------------------------------------------------

  async findAllPermissions() {
    return this.permissionRepository.find();
  }

  async findRolesQueryBuilder() {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.parentRole', 'parentRole')
      .leftJoinAndSelect('role.permissions', 'permission')
      .select([
        'role.id',
        'role.name',
        'parentRole.id',
        'parentRole.name',
        'permission.id',
        'permission.name',
      ]);
  }

  async findRoleById(id: string) {
    return this.roleRepository.findOne({ where: { id } });
  }

  async saveRole(role: Role) {
    this.roleRepository.save(role);
  }

  async removeRole(role: Role) {
    this.roleRepository.remove(role);
  }

  async findParentRoleByHierarchy(hierarchy: number) {
    return this.parentRoleRepository.findOne({ where: { hierarchy } });
  }

  async findAllParentRoles() {
    return this.parentRoleRepository.find();
  }

  async findPermissionsByIds(ids: string[]) {
    return this.permissionRepository.find({ where: { id: In(ids) } });
  }
}
