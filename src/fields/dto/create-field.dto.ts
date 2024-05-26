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
  @IsString()
  @MinLength(2, { message: 'Name must have at least 2 characters.' })
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEnum(FieldType)
  @IsNotEmpty()
  type: FieldType;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray({ message: 'You must provide an array of string' })
  @ValidateIf((f) => f.type === FieldType.list)
  values: string[];
}
