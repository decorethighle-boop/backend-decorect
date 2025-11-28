import { Injectable } from '@nestjs/common';

import { Product } from 'src/modules/products/entities/product.entity';
import { ProductsDbService } from 'src/modules/products/services/products-db.service';
import {
  CreateOrUpdateWishlistDto,
  WishlistProductVariantDto,
} from '../dto/create-or-update-wishlist.dto';
import {
  WhislistCategoryValue,
  WishlistProduct,
  WishlistResponse,
} from '../entities/wishlist.entity';
import { FilterWishlists } from '../types/filter-whislists';
import { WishlistDbService } from './wishlists-db.service';

@Injectable()
export class WishlistService {
  constructor(
    private readonly db: WishlistDbService,
    private readonly productsDbService: ProductsDbService,
  ) {}

  async getWishlists(
    { page = 1, search, justNames }: FilterWishlists,
    token: any,
  ): Promise<{
    wishlists: WishlistResponse[];
    metadata: {
      total: number;
      page: number;
      lastPage: number;
      hasNextPage: boolean;
    };
  }> {
    const limit = 10;
    const skip = (page - 1) * limit;

    // 1. Obtener las Wishlists (Paginadas y filtradas)
    const query = await this.db.getWishlistsQueryBuilder(
      justNames ?? false,
      token,
    );

    if (search) {
      query.andWhere('(wishlist.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [rawWishlists, total] = await query
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    // 2. Recolectar IDs de productos para consulta masiva
    const allProductIds = new Set<string>();
    rawWishlists.forEach(w => {
      if (w.products && Array.isArray(w.products)) {
        w.products.forEach(p => allProductIds.add(p.productId));
      }
    });

    // 3. Obtener productos desde ProductsDbService
    const productsMap = new Map<string, Product>();

    if (allProductIds.size > 0) {
      const productsQb = await this.productsDbService.getProductsQueryBuilder();

      const products = await productsQb
        .where('product.id IN (:...ids)', { ids: Array.from(allProductIds) })
        .getMany();

      products.forEach(p => productsMap.set(p.id, p));
    }

    // 4. Mapear y combinar datos
    const wishlistsResponse: WishlistResponse[] = rawWishlists.map(w => {
      const mappedProducts: WishlistProduct[] = (w.products || [])
        .map(wishlistVariant => {
          // Buscar el producto completo en memoria
          const fullProduct = productsMap.get(wishlistVariant.productId);

          if (!fullProduct) return null;

          const categoryValues: WhislistCategoryValue[] = [];

          // Recorremos las categorías del producto
          // 'cat' es de tipo VariantCategory (aquí vive la propiedad 'grouper')
          fullProduct.categories.forEach(cat => {
            // Guardamos si esta categoría es un grouper
            const isGrouper = cat.grouper ?? false;

            cat.values.forEach(val => {
              // Si el valor está seleccionado en la wishlist
              if (
                wishlistVariant.selectedCategoryValueIds.includes(
                  val.category_value_id,
                )
              ) {
                categoryValues.push({
                  category_value_id: val.category_value_id,
                  name: val.name,
                  grouper: isGrouper,
                  images: val.images,
                });
              }
            });
          });

          return {
            productId: wishlistVariant.productId,
            productName: fullProduct.name,
            variantName: wishlistVariant.variantName,
            categoryValues: categoryValues,
          };
        })
        .filter((p): p is WishlistProduct => p !== null);

      return {
        id: w.id,
        name: w.name,
        products: mappedProducts,
      };
    });

    return {
      wishlists: wishlistsResponse,
      metadata: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  async create(Wishlist: CreateOrUpdateWishlistDto, token: any) {
    await this.db.create(Wishlist, token);
  }

  async update(Wishlist: CreateOrUpdateWishlistDto, token: any) {
    await this.db.update(Wishlist, token);
  }

  async addProductToWishlist(
    wishlistId: string,
    product: WishlistProductVariantDto,
    token: any,
  ) {
    await this.db.addProductToWishlist(wishlistId, product, token);
  }

  async delete(id: string, token: any) {
    await this.db.delete(id, token);
  }
}
