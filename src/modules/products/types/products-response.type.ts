import { Product } from '../entities/product.entity';

export type ProductsVariantsResponse = {
  productId: string;
  categoryValueId: string;
  name: string;
  description: string;
  images?: {
    main_photo: string;
    gallery: string[];
  };
};

export function fromProductsToProductsVariantsResponse(
  products: Product[],
  categoryValueId?: string,
): ProductsVariantsResponse[] {
  const variants: ProductsVariantsResponse[] = [];

  products.forEach(product => {
    const grouperCategory = product.categories.find(cat => cat.grouper);
    if (!grouperCategory) return;

    grouperCategory.values.forEach(grouperValue => {
      if (
        categoryValueId &&
        grouperValue.category_value_id !== categoryValueId
      ) {
        return;
      }

      variants.push({
        productId: product.id,
        categoryValueId: grouperValue.category_value_id,
        name: `${product.name} ${grouperValue.name}`,
        images: grouperValue.images,
        description: product.description,
      });
    });
  });

  return variants;
}
