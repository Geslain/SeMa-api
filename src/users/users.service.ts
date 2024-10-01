import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InitializeUserDto } from './dto/initialize-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  initialize(initializeUserDto: InitializeUserDto) {
    const user = new User();

    user.email = initializeUserDto.email;

    return this.userRepository.save(user);
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

  async remove(id: string) {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      return null;
    }

    return result;
  }
}
