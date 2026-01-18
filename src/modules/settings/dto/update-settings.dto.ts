export type SettingsDataUnion = HomePageData | InfoData | SettingsData;

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
  showroom: Showroom;
}

export class VariantCard {
  selectedPhoto: string;
  productId: string;
  productName: string;
  variantName: string;
  variantImage: string;
  selectedCategoryValueIds: string[];
}

export class ProductRange {
  id: string;
  name: string;
  imageBanner: string;
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
    typeof data?.show_suppliers === 'boolean' && typeof data?.logo === 'string'
  );
}
