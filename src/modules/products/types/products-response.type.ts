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
    let filterCategoryDependsOn: boolean | undefined = undefined;

    if (categoryValueId && !filterIsGrouper && foundValue) {
      filterValueRules = (foundValue.value as any).rules;
      filterCategoryDependsOn = foundValue.category.depends_on;
    }

    // Helper: lista de generated variants del producto (seguro)
    const generatedVariants = Array.isArray(product.variants)
      ? product.variants
      : [];

    // Recorrer valores del agrupador efectivo
    effectiveGrouper.values.forEach(grouperValue => {
      // Aplicar lógica de inclusión
      if (!categoryValueId) {
        // sin filtro: incluir todo (sigue a la comprobación de generatedVariants más abajo)
      } else if (filterIsGrouper) {
        // filtrar por valor del agrupador efectivo
        if (grouperValue.category_value_id !== categoryValueId) return;
      } else {
        // filtro por otra categoría → aplicar reglas si existen
        if (filterValueRules) {
          // Si hay reglas definidas, aplicarlas
          const allowedForThisGrouper =
            filterValueRules[effectiveGrouper.category.category_id];

          if (Array.isArray(allowedForThisGrouper)) {
            if (!allowedForThisGrouper.includes(grouperValue.category_value_id))
              return;
          }
        }
        // Si no hay reglas pero depends_on es false, no aplicamos reglas
        // Pero aún necesitamos verificar que exista la combinación en generatedVariants
      }

      // LÓGICA CORREGIDA: verificar que exista al menos un GeneratedVariant que contenga:
      // 1. El categoryValueId del grouperValue
      // 2. Si se pasó un categoryValueId de filtro, también debe contenerlo
      const shouldIncludeBecauseOfGeneratedVariant = generatedVariants.some(
        gen => {
          // Obtener todos los IDs del GeneratedVariant
          const categoryIdsFromGen =
            Array.isArray((gen as any).categories) &&
            (gen as any).categories.map((c: any) => c.categoryValueId);
          const valueIdsFromGen =
            Array.isArray((gen as any).values) &&
            (gen as any).values.map((v: any) => v.valueId);

          const collectedIds = [
            ...(Array.isArray(categoryIdsFromGen) ? categoryIdsFromGen : []),
            ...(Array.isArray(valueIdsFromGen) ? valueIdsFromGen : []),
          ];

          // Verificar si contiene el valor del grouper
          const containsGrouperValue = collectedIds.includes(
            grouperValue.category_value_id,
          );

          if (!containsGrouperValue) return false;

          // Si hay un filtro, verificar según el tipo de filtro
          if (categoryValueId) {
            // Si el filtro es del grouper, ya fue verificado arriba (filterIsGrouper)
            if (filterIsGrouper) return true;

            // Si depends_on es false, no necesitamos verificar que contenga el filtro
            // porque estos valores están disponibles para todas las combinaciones
            if (filterCategoryDependsOn === false) return true;

            // Para filtros con depends_on true, verificar que contenga el valor del filtro
            return collectedIds.includes(categoryValueId);
          }

          // Sin filtro: solo necesita contener el grouperValue
          return true;
        },
      );

      if (!shouldIncludeBecauseOfGeneratedVariant) {
        // No hay ningún GeneratedVariant que use este valor del agrupador
        // (y también el filtro si se pasó y es necesario) → no generar la variante agrupada
        return;
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
