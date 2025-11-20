import { Product } from '../entities/product.entity';

export type ProductsVariantsResponse = {
  productId: string;
  categoryValueId?: string;
  name: string;
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

    // ¿El filter corresponde a un valor del grouper?
    const filterIsGrouper = Boolean(
      categoryValueId &&
        grouperCategory.values.some(
          v => v.category_value_id === categoryValueId,
        ),
    );

    // Si el filtro NO es de la agrupadora, buscamos el valor en las demás categorías
    let filterValueRules: Record<string, string[]> | undefined = undefined;
    if (categoryValueId && !filterIsGrouper) {
      // encontramos el value (si existe) en cualquier categoría del producto
      const found = product.categories
        .flatMap(c => c.values.map(v => ({ category: c, value: v })))
        .find(({ value }) => value.category_value_id === categoryValueId);

      if (!found) {
        // si el producto no contiene ese categoryValueId, ignoramos este producto
        return;
      }

      // guardamos sus rules (pueden ser undefined)
      // NOTE: la estructura de `rules` en tu ejemplo es { "<grouper_category_id>": ["<grouper_value_id>", ...] }
      filterValueRules = (found.value as any).rules;
    }

    grouperCategory.values.forEach(grouperValue => {
      // Decisión: incluir o no esta variante según el filtro
      if (!categoryValueId) {
        // sin filtro: incluir todo
      } else if (filterIsGrouper) {
        // filtro por valor de la agrupadora: incluir sólo si coinciden
        if (grouperValue.category_value_id !== categoryValueId) return;
      } else {
        // filtro por otra categoría: respetar rules del value filtrado
        if (filterValueRules) {
          const allowedForThisGrouper =
            filterValueRules[grouperCategory.category_id];
          // Si hay un entry explícito para la agrupadora, entonces la inclusión depende de él.
          if (Array.isArray(allowedForThisGrouper)) {
            if (!allowedForThisGrouper.includes(grouperValue.category_value_id))
              return;
          }
          // Si no existe la key para la agrupadora en rules -> se asume aplica a cualquier variante -> incluir
        }
        // Si filterValueRules es undefined -> no hay rules -> aplica a cualquier variante -> incluir
      }

      variants.push({
        productId: product.id,
        categoryValueId: grouperValue.category_value_id,
        name: `${product.name} ${grouperValue.name}`,
        images: grouperValue.images,
      });
    });
  });

  return variants;
}
