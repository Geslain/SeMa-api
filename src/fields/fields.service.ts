import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { MissingUserError } from '../utils/errors';
import { UsersService } from '../users/users.service';

import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { Field } from './entities/field.entity';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field) private fieldRepository: Repository<Field>,
    @Inject(UsersService) private userService: UsersService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  missingUserHandler() {
    if (!('user' in this.request)) {
      throw new MissingUserError();
    }
  }

  async create(createFieldDto: CreateFieldDto) {
    this.missingUserHandler();

    if ('user' in this.request) {
      const { username } = this.request.user as { username: string };
      const owner = await this.userService.findOneByEmail(username);

      const { name, values, type } = createFieldDto;
      const field = new Field();
      field.name = name;
      field.values = values;
      field.type = type;
      field.owner = owner;

      return this.fieldRepository.save(field);
    }
  }

  findAll() {
    this.missingUserHandler();

    if ('user' in this.request) {
      const owner = this.request.user as User;
      return this.fieldRepository.find({
        where: {
          owner: {
            id: owner.id,
          },
        },
        relations: {
          owner: true,
        },
      });
    }
  }

  findOne(id: string) {
    this.missingUserHandler();

    return this.fieldRepository.findOneBy({ id });
  }

  async update(id: string, updateFieldDto: UpdateFieldDto) {
    this.missingUserHandler();

    const field = await this.fieldRepository.findOneBy({ id });

    if (!field) return null;

    const { name, values, type } = updateFieldDto;

    field.name = name;
    field.values = values;
    field.type = type;

    return this.fieldRepository.save(field);
  }

  async remove(id: string) {
    this.missingUserHandler();

    const result = await this.fieldRepository.delete(id);

    if (result.affected === 0) {
      return null;
    }

    return result;
  }
}
