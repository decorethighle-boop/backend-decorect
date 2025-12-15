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
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AddProductToWishlistPipe } from '../pipes/add-product-to-wishlist/add-product-to-wishlist.pipe';

import {
  CreateOrUpdateWishlistDto,
  WishlistProductVariantDto,
} from '../dto/create-or-update-wishlist.dto';
import { CreateOrUpdateWishlistPipe } from '../pipes/create-or-update-whishlist/create-or-update-whishlist.pipe';
import { GetWishlistsPipe } from '../pipes/get-wishlists/get-wishlists.pipe';
import { WishlistService } from '../services/wishlists.service';
import { type FilterWishlists } from '../types/filter-whislists';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly service: WishlistService) {}

  @Get('has-wishlists')
  async hasWishlists(@Req() req: Request, @Res() res: Response) {
    try {
      const hasWishlists = await this.service.hasWishlists(req['user']);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: hasWishlists,
        message: 'Wishlists fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: false,
        message: error.message || 'Error fetching Wishlists',
      });
    }
  }

  @Get('')
  @UsePipes(GetWishlistsPipe)
  async getWishlists(
    @Query() filters: FilterWishlists,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const Wishlists = await this.service.getWishlists(filters, req['user']);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: Wishlists,
        message: 'Wishlists fetched',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error fetching Wishlists',
      });
    }
  }

  @Post('')
  @UsePipes(CreateOrUpdateWishlistPipe)
  async createWishlist(
    @Body() body: CreateOrUpdateWishlistDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.service.create(body, req['user']);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Wishlist created',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error creating Wishlist',
      });
    }
  }

  @Put('/:id')
  @UsePipes(CreateOrUpdateWishlistPipe)
  async updateWishlist(
    @Param('id') id: string,
    @Body() body: CreateOrUpdateWishlistDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.service.update({ ...body, id: id }, req['user']);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Wishlist updated',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error updating Wishlist',
      });
    }
  }

  @Post('/:id/products')
  @UsePipes(AddProductToWishlistPipe)
  async addProductToWishlist(
    @Param('id') id: string,
    @Body() body: WishlistProductVariantDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.service.addProductToWishlist(id, body, req['user']);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Product added to Wishlist',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error adding product to Wishlist',
      });
    }
  }

  @Delete('/:id')
  async deleteWishlist(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.service.delete(id, req['user']);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Wishlist deleted',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message: error.message || 'Error deleting Wishlist',
      });
    }
  }

  @Delete('/:id/products/:productId/:variantName')
  async removeProductFromWishlist(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Param('variantName') variantName: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.service.removeProductFromWishlist(
        id,
        productId,
        variantName,
        req['user'],
      );
      return res.status(HttpStatus.OK).json({
        success: true,
        data: null,
        message: 'Product variant removed from Wishlist',
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        message:
          error.message || 'Error removing product variant from Wishlist',
      });
    }
  }
}
