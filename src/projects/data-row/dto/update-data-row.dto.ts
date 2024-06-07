import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UpdateDataRowFieldDto } from '../data-row-field/dto/update-data-row-field.dto';

export class UpdateDataRowDto {
  @IsArray()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => UpdateDataRowFieldDto)
  fields: UpdateDataRowFieldDto[];
}
