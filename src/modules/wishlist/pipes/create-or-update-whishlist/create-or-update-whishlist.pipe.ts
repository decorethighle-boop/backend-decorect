import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomHttpException } from 'src/global/exceptions/custom-exception';
import { CreateOrUpdateWishlistDto } from '../../dto/create-or-update-wishlist.dto';

@Injectable()
export class CreateOrUpdateWishlistPipe implements PipeTransform {
  transform(value: CreateOrUpdateWishlistDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const { id, name, products } = value;

    if (!id || typeof id !== 'string') {
      throw new CustomHttpException('Wishlist must have a valid ID');
    }

    if (!name) {
      throw new CustomHttpException('Wishlist must have a name');
    }

    if (!products || !Array.isArray(products)) {
      throw new CustomHttpException('Products must be an array');
    }

    return value;
  }
}
