import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { WishlistProductVariantDto } from '../../dto/create-or-update-wishlist.dto';

@Injectable()
export class AddProductToWishlistPipe implements PipeTransform {
  transform(value: WishlistProductVariantDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { productId, variantName, selectedCategoryValueIds } = value;

    if (!productId || typeof productId !== 'string') {
      throw new Error('Product must have a valid ID');
    }

    if (!variantName) {
      throw new Error('Product must have a name');
    }

    if (!selectedCategoryValueIds || !Array.isArray(selectedCategoryValueIds)) {
      throw new Error('Categories must be an array');
    }

    return value;
  }
}
