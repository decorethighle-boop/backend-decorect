import { createClerkClient } from '@clerk/backend';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  convertParentRoleToRole,
  ParentRole,
  Permission,
  Role,
  User,
} from '../entities';
import { TokenService } from '../tokens/token.service';
import { CreateOrUpdatePermission } from '../types/create-or-update-permission.type';
import { CreateOrUpdateRoleType } from '../types/create-or-update-role.type';
import { FilterRoles } from '../types/filter-roles.type';
import { FilterUsers } from '../types/filter-users.type';
import { createJwtPayload } from '../types/jwt-payload.interface';
import { LoginType } from '../types/login.type';
import { TokenResponse } from '../types/token-response';

@Injectable()
export class AuthService implements OnModuleInit {
  private clerkClient: ReturnType<typeof createClerkClient>;

  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(ParentRole)
    private parentRoleRepository: Repository<ParentRole>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async onModuleInit() {
    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    if (!clerkSecretKey) {
      throw new Error(
        'CLERK_SECRET_KEY is not defined in environment variables',
      );
    }

    this.clerkClient = createClerkClient({
      secretKey: clerkSecretKey,
    });

    console.log('Clerk client initialized successfully');
  }

  // --------------------------------------------------------------------------------
  // Users
  // --------------------------------------------------------------------------------

  async login(body: LoginType) {
    if (!this.clerkClient) {
      throw new InternalServerErrorException('Error logging in');
    }

    try {
      const clerkUser = await this.clerkClient.users.getUser(body.clerkUserId);

      let user = await this.userRepository.findOne({
        where: { clerkUserId: body.clerkUserId },
        relations: ['parentRole', 'role'],
      });

      if (!user) {
        const defaultParentRole = await this.parentRoleRepository.findOne({
          where: { hierarchy: 1 },
        });

        if (!defaultParentRole) {
          throw new InternalServerErrorException('Error logging in');
        }
        user = new User();
        user.clerkUserId = body.clerkUserId;
        user.firstName = clerkUser.firstName;
        user.lastName = clerkUser.lastName;
        user.imageUrl = clerkUser.imageUrl;
        user.email = clerkUser.emailAddresses[0]?.emailAddress;
        user.parentRole = defaultParentRole;

        await this.userRepository.save(user);
      }

      const jwtPayload = createJwtPayload({
        sub: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        email: user.email,
        role: user.role ? user.role : undefined,
        parentRole: user.parentRole,
      });

      return this.tokenService.generateTokens(jwtPayload);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Error logging in',
      );
    }
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    return this.tokenService.refreshTokens(refreshToken);
  }

  async getRoleByUserId(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['parentRole', 'role'],
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching user role');
    }
  }

  async getAllUsers({ page = 1, search, roleId }: FilterUsers) {
    try {
      const limit = 18;
      const skip = (page - 1) * limit;

      const query = this.userRepository
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
        ])
        .orderBy('user.created_at', 'DESC')
        .take(limit)
        .skip(skip);

      if (search) {
        query.andWhere(
          `(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)`,
          { search: `%${search}%` },
        );
      }

      if (roleId) {
        query.andWhere(`(role.id = :roleId OR parentRole.id = :roleId)`, {
          roleId,
        });
      }

      const [users, total] = await query.getManyAndCount();

      return {
        users,
        metadata: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new InternalServerErrorException('User not found');
      }

      await this.userRepository.remove(user);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  // --------------------------------------------------------------------------------
  // Permissions
  // --------------------------------------------------------------------------------

  async getPermissions() {
    try {
      const permissions = await this.permissionRepository.find();
      return permissions;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching permissions');
    }
  }

  async createPermission(permission: CreateOrUpdatePermission) {
    try {
      const newPermission = this.permissionRepository.create({
        id: permission.id,
        name: permission.name,
        description: permission.description,
      });

      await this.permissionRepository.save(newPermission);
    } catch (error) {
      throw new InternalServerErrorException('Error creating permission');
    }
  }

  async updatePermission(permission: CreateOrUpdatePermission) {
    try {
      const permissionToUpdate = await this.permissionRepository.findOne({
        where: { id: permission.id },
      });

      if (!permissionToUpdate) {
        throw new NotFoundException(
          `Permission with ID ${permission.id} not found`,
        );
      }

      const updatedPermission = this.permissionRepository.merge(
        permissionToUpdate,
        {
          name: permission.name,
          description: permission.description,
        },
      );

      await this.permissionRepository.save(updatedPermission);
    } catch (error) {
      throw new InternalServerErrorException('Error updating permission');
    }
  }

  async deletePermission(permissionId: string) {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id: permissionId },
      });

      if (!permission) {
        throw new NotFoundException(
          `Permission with ID ${permissionId} not found`,
        );
      }

      await this.permissionRepository.remove(permission);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting permission');
    }
  }

  // --------------------------------------------------------------------------------
  // Roles
  // --------------------------------------------------------------------------------

  async getRoles({ page = 1, search, parentRoleId }: FilterRoles) {
    try {
      const limit = page.toString() === '1' ? 17 : 18;
      const skip = (page - 1) * limit;

      const query = this.roleRepository
        .createQueryBuilder('role')
        .select(['role.id', 'role.name'])
        .leftJoinAndSelect('role.parentRole', 'parentRole')
        .leftJoinAndSelect('role.permissions', 'permission')
        .select([
          'role.id',
          'role.name',
          'parentRole.id',
          'parentRole.name',
          'permission.id',
          'permission.name',
        ])
        .take(limit)
        .skip(skip);

      if (search) {
        query.andWhere(
          `(role.name ILIKE :search OR parentRole.name ILIKE :search)`,
          { search: `%${search}%` },
        );
      }

      if (parentRoleId) {
        query.andWhere('parentRole.id = :parentRoleId', { parentRoleId });
      }

      let [roles, total] = await query.getManyAndCount();

      let extraParentRole: Role | null = null;
      if (page.toString() === '1' && (search === '' || !search)) {
        const parentRole = await this.parentRoleRepository.findOne({
          where: { hierarchy: 2 },
        });

        if (!parentRole) {
          throw new InternalServerErrorException('Error fetching parent role');
        }

        extraParentRole = convertParentRoleToRole(parentRole);
        total += 1;
      }

      return {
        roles: extraParentRole ? [extraParentRole, ...roles] : roles,
        metadata: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
        },
      };
    } catch (error) {
      console.error('getRoles error:', error);
      throw error;
    }
  }

  async getParentRoles() {
    try {
      const parentRoles = await this.parentRoleRepository.find();
      return parentRoles;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching parent roles');
    }
  }

  async createRole(role: CreateOrUpdateRoleType) {
    try {
      const parentRole = await this.parentRoleRepository.findOne({
        where: { hierarchy: 2 },
      });
      if (!parentRole) {
        throw new NotFoundException(`Parent role not found`);
      }

      const permissions = await this.permissionRepository.find({
        where: { id: In(role.permissions) },
      });

      if (permissions.length !== role.permissions.length) {
        throw new NotFoundException(`Some permissions were not found`);
      }

      const newRole = this.roleRepository.create({
        id: role.id,
        name: role.name,
        parentRole,
        permissions,
      });

      await this.roleRepository.save(newRole);
    } catch (error) {
      console.error('Error creating role:', error);
      throw new InternalServerErrorException('Error creating role');
    }
  }

  async updateRole(role: CreateOrUpdateRoleType) {
    try {
      const roleToUpdate = await this.roleRepository.findOne({
        where: { id: role.id },
      });

      if (!roleToUpdate) {
        throw new NotFoundException(`Role not found`);
      }

      const permissions = await this.permissionRepository.find({
        where: { id: In(role.permissions) },
      });

      if (permissions.length !== role.permissions.length) {
        throw new NotFoundException(`Some permissions were not found`);
      }

      const updatedRole = this.roleRepository.merge(roleToUpdate, {
        name: role.name,
        permissions,
      });

      await this.roleRepository.save(updatedRole);
    } catch (error) {
      throw new InternalServerErrorException('Error updating role');
    }
  }

  async deleteRole(roleId: string) {
    try {
      const role = await this.roleRepository.findOne({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      await this.roleRepository.remove(role);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting role');
    }
  }
}
