import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import {
  CreateOrUpdateProductDto,
  VariantCategoriesDto,
  VariantCategoryValueDto,
} from '../../dto/create-or-update-product.dto';

@Injectable()
export class CreateOrUpdateProductPipe implements PipeTransform {
  transform(value: CreateOrUpdateProductDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { id, name, productTypeId, description, categories } = value;

    if (!id || typeof id !== 'string') {
      throw new CustomHttpException('Product must have a valid ID');
    }

    if (!name) {
      throw new CustomHttpException('Product must have a name');
    }

    if (!productTypeId) {
      throw new CustomHttpException('Product must have a product type');
    }

    if (!description) {
      throw new CustomHttpException('Product must have a description');
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      throw new CustomHttpException('Categories must be an array');
    }

    const grouperCount = categories.filter(c => c.grouper).length;
    if (grouperCount > 1) {
      throw new CustomHttpException('Only one category can be a grouper');
    }

    categories.forEach((category: VariantCategoriesDto) => {
      const valuesWithImages = category.values.filter(
        (v: VariantCategoryValueDto) => v.images,
      );
      if (
        valuesWithImages.length > 0 &&
        valuesWithImages.length !== category.values.length
      ) {
        throw new CustomHttpException(
          `All values in category ${category.name} must have images if one of them has images`,
        );
      }
    });
    return value;
  }
}
