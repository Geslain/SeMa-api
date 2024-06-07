import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { FieldType } from '../entities/field.entity';
import { IsFieldValues } from '../../common/decorators/is-field-values.decorator';

export class CreateFieldDto {
  @ApiProperty()
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEnum(FieldType)
  @IsNotEmpty()
  type: FieldType;

  @ApiProperty()
  @IsFieldValues()
  @IsArray({ message: 'You must provide an array of string' })
  @ValidateIf((f) => f.type === FieldType.LIST)
  values?: string[];
}
