import { createClerkClient } from '@clerk/backend';
import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentRole, User } from '../entities';
import { TokenService } from '../tokens/token.service';
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
    @InjectRepository(ParentRole)
    private parentRoleRepository: Repository<ParentRole>,
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

  async login(body: LoginType) {
    if (!this.clerkClient) {
      throw new InternalServerErrorException('Error logging in');
    }

    try {
      const clerkUser = await this.clerkClient.users.getUser(body.clerkUserId);

      const defaultParentRole = await this.parentRoleRepository.findOne({
        where: { hierarchy: 1 },
      });

      if (!defaultParentRole) {
        throw new InternalServerErrorException('Error logging in');
      }

      let user = await this.userRepository.findOne({
        where: { clerkUserId: body.clerkUserId },
        relations: ['parentRole', 'role'],
      });

      if (!user) {
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
      console.error('Error en login:', error);
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
      console.error('Error fetching user role:', error);
      throw new InternalServerErrorException('Error fetching user role');
    }
  }
}
