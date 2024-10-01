import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty()
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
