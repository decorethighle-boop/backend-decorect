export type SettingsDataUnion =
  | HomePageData
  | InfoData
  | SettingsData
  | WhishlistData
  | RangesData
  | ProductTypeData;

export interface UpdateSettingsDto {
  data: SettingsDataUnion;
}

// =============================================================================
// HOMEPAGE
// =============================================================================
export class HomePageData {
  bannerImage: string;
  text: string;
  buttonText: string;
  buttonLink: string;
  cards: VariantCard[];
  ranges: ProductRange[];
  categories: CategoriesCard[];
  showroom: Showroom;
}

export class VariantCard {
  selectedPhoto: string;
  productId: string;
  productName: string;
  variantName: string;
  customName?: string;
  customDescription?: string;
  variantImage: string;
  selectedCategoryValueIds: string[];
}

export class ProductRange {
  id: string;
  name: string;
  imageBanner: string;
}

export class CategoriesCard {
  productTypeId: string;
  categoryId: string;
  categoryName: string;
  categoryValueId: string;
  categoryValueName: string;
  image: string;
}

export class Showroom {
  image: string;
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
}

export function isHomePageData(data: any): data is HomePageData {
  return (
    typeof data?.bannerImage === 'string' &&
    Array.isArray(data?.cards) &&
    data?.showroom !== undefined
  );
}

// =============================================================================
// INFO
// =============================================================================
export class InfoData {
  telephone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  x_twitter?: string;
  linkedin?: string;
  youtube?: string;
  terms_link?: string;
}

export function isInfoData(data: any): data is InfoData {
  return (
    typeof data?.email === 'string' ||
    typeof data?.telephone === 'string' ||
    typeof data?.address === 'string'
  );
}

// =============================================================================
// SETTINGS
// =============================================================================
export class SettingsData {
  show_suppliers: boolean;
  logo: string;
  footerLogo: string;
}

export function isSettingsData(data: any): data is SettingsData {
  return (
    typeof data?.show_suppliers === 'boolean' &&
    typeof data?.logo === 'string' &&
    typeof data?.footerLogo === 'string'
  );
}

// =============================================================================
// WHISHLIST
// =============================================================================
export class WhishlistData {
  wishlistBanner: string;
  wishlistText: string;
}

export function isWishlistData(data: any): data is WhishlistData {
  return (
    typeof data?.wishlistBanner === 'string' &&
    typeof data?.wishlistText === 'string'
  );
}

// =============================================================================
// RANGES
// =============================================================================
export class RangesData {
  rangesBanner: string;
  rangesText: string;
}

export function isRangesData(data: any): data is RangesData {
  return (
    typeof data?.rangesBanner === 'string' &&
    typeof data?.rangesText === 'string'
  );
}

// =============================================================================
// PRODUCTTYPE
// =============================================================================
export class ProductTypeData {
  productTypesBanner: ProductTypesBanner[];
}

export class ProductTypesBanner {
  productTypeId: string;
  productTypeName: string;
  imageBanner: string;
}

export function isProductTypeData(data: any): data is ProductTypeData {
  return (
    Array.isArray(data?.productTypesBanner) &&
    data?.productTypesBanner.every(item => isProductTypesBanner(item))
  );
}

export function isProductTypesBanner(data: any): data is ProductTypesBanner {
  return (
    typeof data?.productTypeId === 'string' &&
    typeof data?.productTypeName === 'string' &&
    typeof data?.imageBanner === 'string'
  );
}
