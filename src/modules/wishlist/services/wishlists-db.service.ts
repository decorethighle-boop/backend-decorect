import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/entities';
import { Repository } from 'typeorm';
import {
  CreateOrUpdateWishlistDto,
  WishlistProductVariantDto,
} from '../dto/create-or-update-wishlist.dto';
import { Wishlist } from '../entities/wishlist.entity';

@Injectable()
export class WishlistDbService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getWishlistsQueryBuilder(justNames: boolean, token: any) {
    const qb = this.wishlistRepository
      .createQueryBuilder('wishlist')
      .where('wishlist.user_id = :userId', { userId: token.sub });

    if (justNames) {
      qb.select(['wishlist.id', 'wishlist.name']);
    } else {
      qb.leftJoinAndSelect('wishlist.user', 'user');
    }

    return qb;
  }

  async create(wishlist: CreateOrUpdateWishlistDto, token: any) {
    const user = await this.userRepository.findOne({
      where: { id: token.sub },
    });

    if (!user) throw new NotFoundException(`User not found`);

    const wishlistEntity = this.wishlistRepository.create({
      ...wishlist,
      user,
    });
    await this.wishlistRepository.save(wishlistEntity);
  }

  async update(wishlist: CreateOrUpdateWishlistDto, token: any) {
    const user = await this.userRepository.findOne({
      where: { id: token.sub },
    });

    if (!user) throw new NotFoundException(`User not found`);

    const wishlistEntity = await this.wishlistRepository.findOne({
      where: { id: wishlist.id },
      relations: ['user'],
    });

    if (!wishlistEntity) throw new NotFoundException(`Wishlist not found`);

    if (wishlistEntity.user.id !== user.id) {
      throw new Error(`User does not own this Wishlist`);
    }

    wishlistEntity.name = Wishlist.name;
    await this.wishlistRepository.save(wishlistEntity);
  }

  async addProductToWishlist(
    wishlistId: string,
    product: WishlistProductVariantDto,
    token: any,
  ) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishlistId },
      relations: ['user'],
    });

    if (!wishlist) throw new NotFoundException(`Wishlist not found`);

    if (wishlist.user.id !== token.sub) {
      throw new Error(`User does not own this Wishlist`);
    }

    const existProductVariant = wishlist.products.find(
      p =>
        p.productId === product.productId &&
        p.variantName === product.variantName,
    );

    if (existProductVariant) {
      throw new Error(`Product variant already exists in Wishlist`);
    }

    wishlist.products.push(product);
    await this.wishlistRepository.save(wishlist);
  }

  async delete(id: string, token: any) {
    const user = await this.userRepository.findOne({
      where: { id: token.sub },
    });

    if (!user) throw new NotFoundException(`User not found`);

    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!wishlist) throw new NotFoundException(`Wishlist not found`);

    if (wishlist.user.id !== user.id) {
      throw new Error(`User does not own this Wishlist`);
    }

    await this.wishlistRepository.delete(id);
  }
}
