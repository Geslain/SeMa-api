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

export class CreateFieldDto {
  @ApiProperty()
  @MinLength(2)
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(FieldType)
  type: FieldType;

  @ApiProperty()
  @IsArray({ message: 'You must provide an array of string' })
  @IsNotEmpty()
  @ValidateIf((f) => f.type === FieldType.list)
  values: string[];
}
