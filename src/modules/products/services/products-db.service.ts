// src/modules/products/services/products-db.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

    @InjectRepository(ProductionCountry)
    private readonly productionCountriesRepository: Repository<ProductionCountry>,
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

    const product = this.productsRepository.create({
      id: body.id,
      name: body.name,
      productType: productType,
      description: body.description,
      productionCountry: productionCountry,
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

    // Nombres de variantes antiguas y nuevas
    const oldVariantNames = product.variants.map(v => v.name);
    const newVariantNames = body.variants.map(v => v.name);

    // Variantes que se eliminarán (existían antes y no vienen en el body)
    const removedVariantNames = oldVariantNames.filter(
      n => !newVariantNames.includes(n),
    );

    // Si no hay variantes removidas no hay conflicto por eliminación
    if (removedVariantNames.length > 0) {
      // Detectar si alguna de las variantes removidas está en algún wishlist
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

      // Si hay referencias y NO nos pasan force -> conflicto
      if (!force && removedVariantsInWishlists.length > 0) {
        throw new ConflictException('WISHLISTSCONFLICT');
      }

      // Si force = true -> eliminar de los wishlists las referencias a las variantes removidas
      if (force && removedVariantNames.length > 0) {
        let modified = false;
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
            // guardamos sólo si hubo cambio
            await this.wishlistRepository.save(w);
            modified = true;
          }
        }
        // si modificamos wishlists, podríamos recargarlos más abajo para recalcular inAWishlist
        // Nota: para escala grande, filtra por wishlist que contienen product.id en vez de traerlos todos.
      }
    }

    // Recargamos wishlists actualizados para saber qué variantes siguen referenciadas
    const updatedWishlists = await this.wishlistRepository.find();

    const productionCountry = await this.productionCountriesRepository.findOne({
      where: { id: body.productionCountryId },
    });

    if (!productionCountry) {
      throw new NotFoundException(`ProductionCountry not found`);
    }

    const isVariantReferenced = (variantName: string) =>
      updatedWishlists.some(w =>
        w.products.some(
          p => p.productId === product.id && p.variantName === variantName,
        ),
      );

    product.name = body.name;
    product.description = body.description;
    product.productionCountry = productionCountry;
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
