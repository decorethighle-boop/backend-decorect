import { createClerkClient } from '@clerk/backend';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateOrUpdateRole } from '../dto/create-or-update-role.type';
import { LoginDto } from '../dto/login.dto';
import { convertParentRoleToRole, Role, User } from '../entities';
import { TokenService } from '../tokens/token.service';
import { FilterRoles } from '../types/filter-roles.type';
import { FilterUsers } from '../types/filter-users.type';
import { createJwtPayload } from '../types/jwt-payload.interface';
import { TokenResponse } from '../types/token-response';
import { AuthDbService } from './auth-db.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private clerkClient: ReturnType<typeof createClerkClient>;

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly db: AuthDbService,
  ) {}

  async onModuleInit() {
    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (!clerkSecretKey)
      throw new Error(
        'CLERK_SECRET_KEY is not defined in environment variables',
      );

    this.clerkClient = createClerkClient({ secretKey: clerkSecretKey });
    console.log('Clerk client initialized successfully');
  }

  // ---------------------------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------------------------

  async login(body: LoginDto) {
    if (!this.clerkClient)
      throw new InternalServerErrorException('Error logging in');

    try {
      const clerkUser = await this.clerkClient.users.getUser(body.clerkUserId);

      let user = await this.db.findUserByClerkId(body.clerkUserId);

      if (!user) {
        const defaultParentRole = await this.db.findParentRoleByHierarchy(1);
        if (!defaultParentRole)
          throw new InternalServerErrorException('Error logging in');

        user = new User();
        user.clerkUserId = body.clerkUserId;
        user.firstName = clerkUser.firstName;
        user.lastName = clerkUser.lastName;
        user.imageUrl = clerkUser.imageUrl;
        user.email = clerkUser.emailAddresses[0]?.emailAddress;
        user.parentRole = defaultParentRole;
        await this.db.saveUser(user);
      }

      const jwtPayload = createJwtPayload({
        sub: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        email: user.email,
        role: user.role ?? undefined,
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

  // ---------------------------------------------------------------------------
  // USERS
  // ---------------------------------------------------------------------------

  async getRoleByUserId(userId: string) {
    return this.db.findUserById(userId);
  }

  async getAllUsers({ page = 1, search, roleId }: FilterUsers, userId: string) {
    try {
      const limit = 18;
      const skip = (page - 1) * limit;

      const query = await this.db.getUsersQueryBuilder();
      query
        .orderBy('user.created_at', 'DESC')
        .take(limit)
        .skip(skip)
        .andWhere('user.id != :userId', { userId });

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
    } catch {
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  async addRoleToUser(userId: string, roleId: string) {
    await this.db.addRoleToUser(userId, roleId);
  }

  async deleteUser(userId: string) {
    await this.db.deleteUserById(userId);
  }

  // ---------------------------------------------------------------------------
  // PERMISSIONS
  // ---------------------------------------------------------------------------

  async getPermissions() {
    return this.db.findAllPermissions();
  }

  // ---------------------------------------------------------------------------
  // ROLES
  // ---------------------------------------------------------------------------

  async getRoles({ page = 1, search, parentRoleId }: FilterRoles) {
    try {
      const limit = page.toString() === '1' ? 16 : 18;
      const skip = (page - 1) * limit;

      // Query principal
      const query = await this.db.findRolesQueryBuilder();
      query.take(limit).skip(skip);

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
      let extraParentRoles: Role[] = [];

      if (page.toString() === '1') {
        let parentRoles = await this.db.findAllParentRoles();

        if (search) {
          const lowerSearch = search.toLowerCase();
          parentRoles = parentRoles.filter(p =>
            p.name.toLowerCase().includes(lowerSearch),
          );
        }

        extraParentRoles = parentRoles.map(p => convertParentRoleToRole(p));
        total += extraParentRoles.length;
      }

      const finalRoles = extraParentRoles.length
        ? [...extraParentRoles, ...roles]
        : roles;

      return {
        roles: finalRoles,
        metadata: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async createRole(role: CreateOrUpdateRole) {
    try {
      const forbiddenNames = ['admin', 'user'];

      if (forbiddenNames.includes(role.name.toLowerCase())) {
        throw new BadRequestException('Role name not allowed');
      }

      const parentRole = await this.db.findParentRoleByHierarchy(2);
      if (!parentRole) {
        throw new NotFoundException('Parent role not found');
      }

      const permissions = await this.db.findPermissionsByIds(role.permissions);
      if (permissions.length !== role.permissions.length) {
        throw new NotFoundException('Some permissions were not found');
      }

      const newRole = new Role();
      newRole.id = role.id;
      newRole.name = role.name;
      newRole.parentRole = parentRole;
      newRole.permissions = permissions;

      await this.db.saveRole(newRole);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Error creating role');
    }
  }

  async updateRole(role: CreateOrUpdateRole) {
    try {
      const forbiddenNames = ['admin', 'user'];

      if (forbiddenNames.includes(role.name.toLowerCase())) {
        throw new BadRequestException('Role name not allowed');
      }
      const roleToUpdate = await this.db.findRoleById(role.id);
      if (!roleToUpdate) throw new NotFoundException(`Role not found`);

      const permissions = await this.db.findPermissionsByIds(role.permissions);
      if (permissions.length !== role.permissions.length)
        throw new NotFoundException(`Some permissions were not found`);

      roleToUpdate.name = role.name;
      roleToUpdate.permissions = permissions;

      await this.db.saveRole(roleToUpdate);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating role');
    }
  }

  async deleteRole(roleId: string) {
    const role = await this.db.findRoleById(roleId);
    if (!role) throw new NotFoundException(`Role with ID ${roleId} not found`);
    await this.db.removeRole(role);
  }
}
