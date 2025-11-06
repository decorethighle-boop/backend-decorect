import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateOrUpdateCategoryDto } from '../../dto/create-or-update-category.dto';

@Injectable()
export class CreateOrUpdateParentPipe implements PipeTransform {
  transform(value: CreateOrUpdateCategoryDto, metadata: ArgumentMetadata) {
    const { id, name } = value;

    if (id && typeof id !== 'string') {
      throw new Error('Parent category must have a valid ID');
    }

    if (!name) {
      throw new Error('Parent category must have a name');
    }

    return value;
  }
}
