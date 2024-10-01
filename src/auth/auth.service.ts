import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { CreatedUserException, InvalidUserException } from '../common/errors';

import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn(signInDto: SignInDto): Promise<any> {
    const user = await this.usersService.findOneByEmail(
      signInDto.email.toLowerCase(),
    );

    if (!user) {
      await this.usersService.initialize(signInDto);
      throw new CreatedUserException();
    } else if (!user.isValid()) {
      throw new InvalidUserException();
    }

    return user;
  }
}
