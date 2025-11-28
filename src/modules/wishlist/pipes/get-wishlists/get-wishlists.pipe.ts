import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { FilterWishlists } from '../../types/filter-whislists';

@Injectable()
export class GetWishlistsPipe implements PipeTransform {
  transform(value: FilterWishlists, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }

    const { page, search } = value;

    if (page) {
      value.page = parseInt(page.toString());
    }

    if (search) {
      value.search = search.toString().trim();
    }

    return value;
  }
}
