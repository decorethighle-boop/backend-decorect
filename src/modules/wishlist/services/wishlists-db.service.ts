import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/entities';
import { Product } from 'src/modules/products/entities/product.entity';
import { Repository } from 'typeorm';
import {
  CreateOrUpdateWishlistDto,
  WishlistProductVariantDto,
} from '../dto/create-or-update-wishlist.dto';
import { Wishlist, WishlistProductVariant } from '../entities/wishlist.entity';

@Injectable()
export class WishlistDbService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
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

    await this.updateVariantWishlistFlags(wishlist.products);
  }

  private async updateVariantWishlistFlags(
    products: WishlistProductVariant[],
    wishlistId?: string,
  ) {
    const productIds = [...new Set(products.map(p => p.productId))];

    const productEntities = await this.productsRepository.find({
      where: productIds.map(id => ({ id })),
    });

    for (const prod of productEntities) {
      for (const variant of prod.variants) {
        const wishlistCount = await this.wishlistRepository
          .createQueryBuilder('wishlist')
          .where(
            wishlistId ? 'wishlist.id != :wishlistId' : '1=1',
            wishlistId ? { wishlistId } : {},
          )
          .andWhere(
            `EXISTS (
            SELECT 1
            FROM jsonb_array_elements(wishlist.products) AS product
            WHERE product->>'productId' = :productId
            AND product->>'variantName' = :variantName
          )`,
            {
              productId: prod.id,
              variantName: variant.name,
            },
          )
          .getCount();

        variant.inAWishlist = wishlistCount > 0;
      }

      await this.productsRepository.save(prod);
    }
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

    wishlistEntity.name = wishlist.name;
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

    const productEntity = await this.productsRepository.findOne({
      where: { id: product.productId },
    });

    if (productEntity) {
      const variant = productEntity.variants.find(
        v => v.name === product.variantName,
      );
      if (variant && !variant.inAWishlist) {
        variant.inAWishlist = true;
        await this.productsRepository.save(productEntity);
      }
    }
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

    // Obtener todas las variantes de productos en esta wishlist
    const productVariantsInWishlist = wishlist.products;

    // Eliminar la wishlist
    await this.wishlistRepository.delete(id);

    // Para cada variante en la wishlist eliminada
    for (const variant of productVariantsInWishlist) {
      // Verificar si esta variante está en alguna otra wishlist
      const otherWishlistsWithVariant = await this.wishlistRepository
        .createQueryBuilder('wishlist')
        .where('wishlist.id != :currentWishlistId', { currentWishlistId: id })
        .andWhere('wishlist.user_id = :userId', { userId: token.sub })
        .andWhere(
          `EXISTS (
          SELECT 1
          FROM jsonb_array_elements(wishlist.products) AS product
          WHERE product->>'productId' = :productId
          AND product->>'variantName' = :variantName
        )`,
          {
            productId: variant.productId,
            variantName: variant.variantName,
          },
        )
        .getCount();

      // Si no está en ninguna otra wishlist, actualizar el flag
      if (otherWishlistsWithVariant === 0) {
        const productEntity = await this.productsRepository.findOne({
          where: { id: variant.productId },
        });

        if (productEntity) {
          const variantToUpdate = productEntity.variants.find(
            v => v.name === variant.variantName,
          );

          if (variantToUpdate) {
            variantToUpdate.inAWishlist = false;
            await this.productsRepository.save(productEntity);
          }
        }
      }
    }
  }

  async removeProductFromWishlist(
    wishlistId: string,
    productId: string,
    variantName: string,
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

    // Filtrar el producto a remover
    const initialLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      p => !(p.productId === productId && p.variantName === variantName),
    );

    if (wishlist.products.length === initialLength) {
      throw new NotFoundException(`Product variant not found in Wishlist`);
    }

    await this.wishlistRepository.save(wishlist);

    // Verificar si la variante está en otras wishlists
    const otherWishlistsWithVariant = await this.wishlistRepository
      .createQueryBuilder('wishlist')
      .where('wishlist.id != :currentWishlistId', {
        currentWishlistId: wishlistId,
      })
      .andWhere('wishlist.user_id = :userId', { userId: token.sub })
      .andWhere(
        `EXISTS (
        SELECT 1
        FROM jsonb_array_elements(wishlist.products) AS product
        WHERE product->>'productId' = :productId
        AND product->>'variantName' = :variantName
      )`,
        {
          productId,
          variantName,
        },
      )
      .getCount();

    // Si no está en ninguna otra wishlist, actualizar el flag
    if (otherWishlistsWithVariant === 0) {
      const productEntity = await this.productsRepository.findOne({
        where: { id: productId },
      });

      if (productEntity) {
        const variantToUpdate = productEntity.variants.find(
          v => v.name === variantName,
        );

        if (variantToUpdate) {
          variantToUpdate.inAWishlist = false;
          await this.productsRepository.save(productEntity);
        }
      }
    }
  }
}
