import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateDataRowFieldDto } from '../data-row-field/dto/create-data-row-field.dto';

export class CreateDataRowDto {
  @IsArray()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(/* istanbul ignore next */ () => CreateDataRowFieldDto)
  fields: CreateDataRowFieldDto[];
}
