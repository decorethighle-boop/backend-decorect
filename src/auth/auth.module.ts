import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ParentRole, Permission, Role, User } from './entities';
import { JwtRefreshStrategy } from './jwt/jwt-refresh.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthController } from './services/auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './tokens/token.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role, ParentRole, Permission]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    TokenService,
    JwtService,
  ],
})
export class AuthModule {}
