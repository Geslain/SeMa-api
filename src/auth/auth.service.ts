import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<any> {
    const user = await this.usersService.findOneByEmail(
      signInDto.email.toLowerCase(),
    );

    if (!user) throw new UnauthorizedException();

    const isMatch = await user.comparePassword(signInDto.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.email };
    return {
      user,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.usersService.findOneByEmail(
      signUpDto.email.toLowerCase(),
    );

    if (existingUser) throw new ConflictException('User already exits');

    return this.usersService.create(signUpDto);
  }
}
