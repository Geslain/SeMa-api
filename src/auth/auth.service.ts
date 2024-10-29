import { BadRequestException, Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { CreatedUserException, InvalidUserException } from '../common/errors';

import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn(signInDto: SignInDto): Promise<any> {
    const currentUser = await this.usersService.getCurrent();
    const user = await this.usersService.findOneByEmail(
      signInDto.email.toLowerCase(),
    );

    if (
      currentUser &&
      currentUser.email.toLowerCase() !== signInDto.email.toLowerCase()
    ) {
      throw new BadRequestException();
    }

    if (!user) {
      await this.usersService.initialize(signInDto);
      throw new CreatedUserException();
    } else if (!user.isValid()) {
      throw new InvalidUserException();
    }

    return user;
  }
}
