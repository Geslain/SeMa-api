import { PickType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';

export class UpdateCurrentUserDto extends PickType(CreateUserDto, [
  'firstname',
  'lastname',
]) {}
