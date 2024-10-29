import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common';

import { FieldsService } from '../../fields/fields.service';

import { CreateDataRowDto } from './dto/create-data-row.dto';

/**
 * Validate Data row fields depending on field type
 */
@Injectable({ scope: Scope.REQUEST })
export class DataRowFieldValueValidator implements PipeTransform {
  constructor(private readonly fieldService: FieldsService) {}
  async transform(
    value: string | CreateDataRowDto,
    metadata: ArgumentMetadata,
  ): Promise<any> {
    if (
      metadata.type === 'body' &&
      typeof value !== 'string' &&
      'fields' in value &&
      Array.isArray(value.fields)
    ) {
      const validationErrors = [];
      for (const [
        index,
        { fieldId, value: fieldValue },
      ] of value.fields.entries()) {
        try {
          await this.fieldService.validate(fieldId, fieldValue);
        } catch (e) {
          validationErrors.push(`fields.${index}.value ${e.message}`);
        }
      }

      if (validationErrors.length) {
        throw new BadRequestException(validationErrors);
      }
    }
    return value;
  }
}
