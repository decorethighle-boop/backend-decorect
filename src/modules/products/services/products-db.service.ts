// src/modules/products/services/products-db.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsRange } from 'src/modules/ranges/entities/range.entity';
import { Supplier } from 'src/modules/suppliers/entity/supplier.entity';
import { Wishlist } from 'src/modules/wishlist/entities/wishlist.entity';
import { Repository } from 'typeorm';
import { ProductionCountry } from '../../production_countries/entities/production-country.entity';
import { CreateOrUpdateProductTypeDto } from '../dto/create-or-update-product-type.dto';
import { CreateOrUpdateProductDto } from '../dto/create-or-update-product.dto';
import { ProductType } from '../entities/product-type.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsDbService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(ProductType)
    private readonly productTypesRepository: Repository<ProductType>,

    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,

    @InjectRepository(ProductsRange)
    private readonly rangeRepository: Repository<ProductsRange>,

    @InjectRepository(ProductionCountry)
    private readonly productionCountriesRepository: Repository<ProductionCountry>,

    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
  ) {}

  // --------------------------------------------------------------------------------
  // Product Types
  // --------------------------------------------------------------------------------

  async ensureDefaultProductTypes() {
    const defaultProductTypes = ['Tile'];

    for (const name of defaultProductTypes) {
      const exists = await this.productTypesRepository.findOne({
        where: { name },
      });
      if (!exists) {
        const productType = this.productTypesRepository.create({
          name,
        });
        await this.productTypesRepository.save(productType);
      }
    }
  }

  async getProductTypes() {
    return this.productTypesRepository.find();
  }

  async getProductTypesWithProducts(): Promise<ProductType[]> {
    return this.productTypesRepository
      .createQueryBuilder('productType')
      .innerJoin(Product, 'product', 'product.productType = productType.id')
      .select('productType')
      .distinct(true)
      .getMany();
  }

  async createProductType(body: CreateOrUpdateProductTypeDto) {
    const productType = new ProductType();
    productType.id = body.id;
    productType.name = body.name;
    await this.productTypesRepository.save(productType);
  }

  async updateProductType(body: CreateOrUpdateProductTypeDto) {
    const productType = await this.productTypesRepository.findOne({
      where: { id: body.id },
    });
    if (!productType) throw new NotFoundException(`Product type not found`);
    productType.name = body.name;
    await this.productTypesRepository.save(productType);
  }

  async deleteProductType(id: string) {
    const productType = await this.productTypesRepository.findOne({
      where: { id },
    });
    if (!productType) throw new NotFoundException(`Product type not found`);
    await this.productTypesRepository.remove(productType);
  }

  // --------------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------------

  async getProductsQueryBuilder() {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productType', 'productType')
      .leftJoinAndSelect('product.supplier', 'supplier');
  }

  async getProductById(id: string) {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['productType', 'supplier'],
    });
  }

  async createProduct(body: CreateOrUpdateProductDto) {
    const existingProduct = await this.productsRepository.findOne({
      where: { id: body.id },
    });

    if (existingProduct) {
      throw new ConflictException(`Product already exists`);
    }

    const productType = await this.productTypesRepository.findOne({
      where: { id: body.productTypeId },
    });

    if (!productType) {
      throw new NotFoundException(`ProductType not found`);
    }

    const productionCountry = await this.productionCountriesRepository.findOne({
      where: { id: body.productionCountryId },
    });

    if (!productionCountry) {
      throw new NotFoundException(`ProductionCountry not found`);
    }

    const supplier = await this.suppliersRepository.findOne({
      where: { id: body.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier not found`);
    }

    const product = this.productsRepository.create({
      id: body.id,
      name: body.name,
      productType: productType,
      description: body.description,
      productionCountry: productionCountry,
      supplier: supplier,
      categories: body.categories.map(cat => ({
        ...cat,
        depends_on: cat.depends_on ?? false,
        grouper: cat.grouper ?? false,
      })),
      variants: body.variants.map(v => ({
        ...v,
        inAWishlist: false,
      })),
    });

    await this.productsRepository.save(product);
  }

  async updateProduct(body: CreateOrUpdateProductDto, force: boolean) {
    const product = await this.productsRepository.findOne({
      where: { id: body.id },
    });
    if (!product) throw new NotFoundException(`Product not found`);

    // Obtener todos los wishlists (para escala grande filtra por wishlists que contienen product.id)
    const allWishlists = await this.wishlistRepository.find();

    // Obtener todos los ranges (para escala grande filtra por ranges que contienen product.id)
    const allRanges = await this.rangeRepository.find();

    // Nombres de variantes antiguas y nuevas
    const oldVariantNames = product.variants.map(v => v.name);
    const newVariantNames = body.variants.map(v => v.name);

    // Variantes que se eliminarán (existían antes y no vienen en el body)
    const removedVariantNames = oldVariantNames.filter(
      n => !newVariantNames.includes(n),
    );

    // Si no hay variantes removidas no hay conflicto por eliminación
    if (removedVariantNames.length > 0) {
      // --------- WISHLISTS (lógica existente, sin cambios conceptuales) ----------
      const removedVariantsInWishlists: {
        wishlistId: string;
        wishlistName: string;
        variantName: string;
      }[] = [];

      for (const w of allWishlists) {
        for (const p of w.products) {
          if (
            p.productId === product.id &&
            removedVariantNames.includes(p.variantName)
          ) {
            removedVariantsInWishlists.push({
              wishlistId: w.id,
              wishlistName: w.name,
              variantName: p.variantName,
            });
          }
        }
      }

      if (!force && removedVariantsInWishlists.length > 0) {
        throw new ConflictException('WISHLISTSCONFLICT');
      }

      if (force && removedVariantNames.length > 0) {
        for (const w of allWishlists) {
          const originalLength = w.products.length;
          w.products = w.products.filter(
            p =>
              !(
                p.productId === product.id &&
                removedVariantNames.includes(p.variantName)
              ),
          );

          if (w.products.length !== originalLength) {
            await this.wishlistRepository.save(w);
          }
        }
      }

      // --------- RANGES (nueva lógica equivalente a la de wishlists) ----------
      const removedVariantsInRanges: {
        rangeId: string;
        rangeName: string;
        variantName: string;
      }[] = [];

      for (const r of allRanges) {
        // r.variants es ProductRangeVariant[]
        for (const vr of r.variants || []) {
          if (
            vr.productId === product.id &&
            removedVariantNames.includes(vr.variantName)
          ) {
            removedVariantsInRanges.push({
              rangeId: r.id,
              rangeName: r.name,
              variantName: vr.variantName,
            });
          }
        }
      }

      // Si hay referencias en ranges y NO nos pasan force -> conflicto
      if (!force && removedVariantsInRanges.length > 0) {
        throw new ConflictException('RANGESCONFLICT');
      }

      // Si force = true -> eliminar de los ranges las referencias a las variantes removidas
      if (force && removedVariantNames.length > 0) {
        for (const r of allRanges) {
          const originalLength = (r.variants || []).length;
          r.variants = (r.variants || []).filter(
            v =>
              !(
                v.productId === product.id &&
                removedVariantNames.includes(v.variantName)
              ),
          );

          if ((r.variants || []).length !== originalLength) {
            await this.rangeRepository.save(r);
          }
        }
      }
    }

    // Recargamos wishlists y ranges actualizados para saber qué variantes siguen referenciadas
    const updatedWishlists = await this.wishlistRepository.find();
    const updatedRanges = await this.rangeRepository.find();

    const productionCountry = await this.productionCountriesRepository.findOne({
      where: { id: body.productionCountryId },
    });

    if (!productionCountry) {
      throw new NotFoundException(`ProductionCountry not found`);
    }

    const supplier = await this.suppliersRepository.findOne({
      where: { id: body.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier not found`);
    }

    // Ahora consideramos referencias tanto en wishlists como en ranges
    const isVariantReferenced = (variantName: string) =>
      updatedWishlists.some(w =>
        w.products.some(
          p => p.productId === product.id && p.variantName === variantName,
        ),
      ) ||
      updatedRanges.some(r =>
        (r.variants || []).some(
          v => v.productId === product.id && v.variantName === variantName,
        ),
      );

    product.name = body.name;
    product.description = body.description;
    product.productionCountry = productionCountry;
    product.supplier = supplier;
    product.categories = body.categories.map(cat => ({
      ...cat,
      depends_on: cat.depends_on ?? false,
      grouper: cat.grouper ?? false,
    }));

    product.variants = body.variants.map(newVar => {
      const inAWishlist = isVariantReferenced(newVar.name);

      return {
        ...newVar,
        inAWishlist,
      };
    });

    await this.productsRepository.save(product);
  }

  async deleteProduct(id: string) {
    const product = await this.productsRepository.findOne({
      where: { id },
    });
    if (!product) throw new NotFoundException(`Product not found`);
    await this.productsRepository.remove(product);
  }

  async deleteAllProducts() {
    await this.productsRepository.deleteAll();
  }
}
