import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateOrUpdateRole } from '../dto/create-or-update-role.type';
import { LoginDto } from '../dto/login.dto';
import { Roles, RolesDecorator } from '../guards/roles/roles.decorator';
import { RolesGuard } from '../guards/roles/roles.guard';
import { LoginPipe } from '../pipes/login/login.pipe';
import { RefreshTokenPipe } from '../pipes/refresh-token/refresh-token.pipe';
import { AuthService } from '../services/auth.service';
import type { FilterRoles } from '../types/filter-roles.type';
import type { FilterUsers } from '../types/filter-users.type';
import type { RefreshToken } from '../types/refresh-token.type';

@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --------------------------------------------------------------------------------
  // Users
  // --------------------------------------------------------------------------------

  @Post('login')
  @UsePipes(LoginPipe)
  async login(@Body() body: LoginDto, @Res() res: Response) {
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

  @Get('users')
  @RolesDecorator(Roles.Admin)
  async getAllUsers(@Query() filters: FilterUsers, @Res() res: Response) {
    try {
      const { users, metadata } = await this.authService.getAllUsers(filters);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: { users, metadata },
        message: 'Users fetched successfully',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Users fetch failed',
      });
    }
  }

  @Delete('users/:userId')
  @RolesDecorator(Roles.Admin)
  async deleteUser(@Param('userId') userId: string, @Res() res: Response) {
    try {
      await this.authService.deleteUser(userId);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'User deleted successfully',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'User delete failed',
      });
    }
  }

  // --------------------------------------------------------------------------------
  // Permissions
  // --------------------------------------------------------------------------------

  @Get('permissions')
  @RolesDecorator(Roles.Admin)
  async getPermissions(@Res() res: Response) {
    try {
      const permissions = await this.authService.getPermissions();
      return res.status(HttpStatus.OK).json({
        success: true,
        data: permissions,
        message: 'Permissions fetched successfully',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Permissions fetch failed',
      });
    }
  }

  // --------------------------------------------------------------------------------
  // Roles
  // --------------------------------------------------------------------------------

  @Get('roles')
  @RolesDecorator(Roles.Admin)
  async getRoles(@Query() filters: FilterRoles, @Res() res: Response) {
    try {
      const roles = await this.authService.getRoles(filters);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: roles,
        message: 'Roles fetched successfully',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Roles fetch failed',
      });
    }
  }

  @Post('roles')
  @RolesDecorator(Roles.Admin)
  async createRole(@Body() role: CreateOrUpdateRole, @Res() res: Response) {
    try {
      await this.authService.createRole(role);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Role created successfully',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Role create failed',
      });
    }
  }

  @Put('roles/:roleId')
  @RolesDecorator(Roles.Admin)
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() role: CreateOrUpdateRole,
    @Res() res: Response,
  ) {
    try {
      await this.authService.updateRole({
        ...role,
        id: roleId,
      });
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Role updated successfully',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Role update failed',
      });
    }
  }

  @Delete('roles/:roleId')
  @RolesDecorator(Roles.Admin)
  async deleteRole(@Param('roleId') roleId: string, @Res() res: Response) {
    try {
      await this.authService.deleteRole(roleId);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Role delete failed',
      });
    }
  }
}
