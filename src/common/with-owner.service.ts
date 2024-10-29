import { REQUEST } from '@nestjs/core';
import { Inject, Injectable } from '@nestjs/common';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

import { MissingUserError } from './errors';

@Injectable()
export class WithOwnerService {
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    @Inject(UsersService) protected readonly userService: UsersService,
  ) {}
  protected async getOwner(): Promise<User> {
    if ('user' in this.request) {
      const { username } = this.request.user as { username: string };
      const owner = await this.userService.findOneByEmail(username);

      if (!owner) throw new MissingUserError();

      return owner;
    } else {
      throw new MissingUserError();
    }
  }
}
