import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InitializeUserDto } from './dto/initialize-user.dto';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(REQUEST) protected readonly request: Request,
  ) {}

  initialize(initializeUserDto: InitializeUserDto) {
    const user = new User();

    user.email = initializeUserDto.email;

    return this.userRepository.save(user);
  }

  async getCurrent() {
    if ('user' in this.request && this.request.user) {
      const { username } = this.request.user as { username: string };

      return await this.findOneByEmail(username);
    }
    return null;
  }

  create(createUserDto: CreateUserDto) {
    const user = new User();

    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto.lastname;
    user.email = createUserDto.email;

    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return null;

    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (typeof value !== 'undefined') user[key] = value;
    });

    return this.userRepository.save(user);
  }

  async updateCurrent(updateCurrentUserDto: UpdateCurrentUserDto) {
    const currentUser = await this.getCurrent();
    if (currentUser) {
      Object.entries(updateCurrentUserDto).forEach(([key, value]) => {
        if (typeof value !== 'undefined') currentUser[key] = value;
      });

      return this.userRepository.save(currentUser);
    }
  }

  async remove(id: string) {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      return null;
    }

    return result;
  }
}
