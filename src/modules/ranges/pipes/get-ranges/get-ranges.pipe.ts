import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { FilterRanges } from '../../types/filter-ranges';

@Injectable()
export class GetRangesPipe implements PipeTransform {
  transform(value: FilterRanges, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      return value;
    }

    const { page, search } = value;
    const allQuery = (value as any).all as string | undefined;

    if (page !== undefined) {
      const parsedPage = Number(page);
      value.page = isNaN(parsedPage) ? 1 : parsedPage;
    }

    if (search) {
      value.search = search.trim();
    }

    if (allQuery !== undefined) {
      value.all = allQuery === 'true' || allQuery === '1';
    }

    return value;
  }
}
