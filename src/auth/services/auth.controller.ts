import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { Roles, RolesDecorator } from '../guards/roles/roles.decorator';
import { RolesGuard } from '../guards/roles/roles.guard';
import { LoginPipe } from '../pipes/login/login.pipe';
import { RefreshTokenPipe } from '../pipes/refresh-token/refresh-token.pipe';
import type { LoginType } from '../types/login.type';
import type { RefreshToken } from '../types/refresh-token.type';
import { AuthService } from './auth.service';

@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(LoginPipe)
  async login(@Body() body: LoginType, @Res() res: Response) {
    try {
      const token = await this.authService.login(body);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: token,
        message: token
          ? 'Login successful'
          : 'User created and login successful',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Login failed',
      });
    }
  }

  @Post('refresh')
  @RolesDecorator(Roles.All)
  @UsePipes(RefreshTokenPipe)
  async refresh(@Body() body: RefreshToken, @Res() res: Response) {
    try {
      const newTokens = await this.authService.refresh(body.refreshToken);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: newTokens,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Token refresh failed',
      });
    }
  }
}
