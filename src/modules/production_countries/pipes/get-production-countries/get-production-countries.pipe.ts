import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { FilterProductionCountries } from '../../types/filter-production-countries';

@Injectable()
export class GetProductionCountriesPipe implements PipeTransform {
  transform(value: FilterProductionCountries, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }

    const { page, search } = value;

    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (search) {
      if (typeof search !== 'string') {
        throw new Error('Search must be a string');
      }
    }

    return value;
  }
}
