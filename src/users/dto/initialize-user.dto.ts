import { PickType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';

export class InitializeUserDto extends PickType(CreateUserDto, ['email']) {}
