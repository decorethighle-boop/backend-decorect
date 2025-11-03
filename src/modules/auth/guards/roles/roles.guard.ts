import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { FromHierarchyToRole, Roles, ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomHttpException(
        'Missing or invalid Authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      request['user'] = payload;

      if (requiredRoles.includes(Roles.All)) {
        return true;
      }

      if (
        !requiredRoles.includes(
          FromHierarchyToRole(payload.parentRole.hierarchy),
        )
      ) {
        throw new CustomHttpException(
          'Access denied: insufficient role',
          HttpStatus.FORBIDDEN,
        );
      }

      return true;
    } catch (error) {
      throw new CustomHttpException(
        error.message || 'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
