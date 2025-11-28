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

    // Encontramos el value si coincide con categoryValueId
    const foundValue = categoryValueId
      ? product.categories
          .flatMap(c => c.values.map(v => ({ category: c, value: v })))
          .find(({ value }) => value.category_value_id === categoryValueId)
      : undefined;

    // Si el filtrado viene por un value con imágenes → usar ese value como agrupador
    const overrideGrouperValue =
      foundValue && foundValue.value.images ? foundValue : undefined;

    // Si debemos sustituir la categoría agrupadora original
    const effectiveGrouper = overrideGrouperValue
      ? {
          category: overrideGrouperValue.category,
          values: [overrideGrouperValue.value],
        }
      : {
          category: grouperCategory,
          values: grouperCategory.values,
        };

    // Identificar si el filtro coincide con el "agrupador efectivo"
    const filterIsGrouper = Boolean(
      categoryValueId &&
        effectiveGrouper.values.some(
          v => v.category_value_id === categoryValueId,
        ),
    );

    // Obtener reglas si el filtro NO es del agrupador
    let filterValueRules: Record<string, string[]> | undefined = undefined;

    if (categoryValueId && !filterIsGrouper && foundValue) {
      filterValueRules = (foundValue.value as any).rules;
    }

    // Recorrer valores del agrupador efectivo
    effectiveGrouper.values.forEach(grouperValue => {
      // Aplicar lógica de inclusión
      if (!categoryValueId) {
        // sin filtro: incluir todo
      } else if (filterIsGrouper) {
        // filtrar por valor del agrupador efectivo
        if (grouperValue.category_value_id !== categoryValueId) return;
      } else {
        // filtro por otra categoría → aplicar rules
        if (filterValueRules) {
          const allowedForThisGrouper =
            filterValueRules[effectiveGrouper.category.category_id];

          if (Array.isArray(allowedForThisGrouper)) {
            if (!allowedForThisGrouper.includes(grouperValue.category_value_id))
              return;
          }
        }
      }

      // Construir variante
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
