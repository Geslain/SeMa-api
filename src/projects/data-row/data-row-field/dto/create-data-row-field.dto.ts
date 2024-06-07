import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDataRowFieldDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fieldId: string;
}
