import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';

import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { Field } from './entities/field.entity';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field) private fieldRepository: Repository<Field>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  create(createFieldDto: CreateFieldDto) {
    if ('user' in this.request) {
      const owner = this.request.user as User;

      const { name, values, type } = createFieldDto;
      const field = new Field();
      field.name = name;
      field.values = values;
      field.type = type;
      field.owner = owner;

      return this.fieldRepository.save(field);
    }

    throw new Error("You can't create field without owner");
  }

  findAll() {
    if ('user' in this.request) {
      const owner = this.request.user as User;
      return this.fieldRepository.findBy({ owner });
    }
    throw new Error("You can't get fields without an owner");
  }

  findOne(id: string) {
    if ('user' in this.request) {
      return this.fieldRepository.findOneBy({ id });
    }
    throw new Error("You can't get a field without an owner");
  }

  async update(id: string, updateFieldDto: UpdateFieldDto) {
    if ('user' in this.request) {
      const field = await this.fieldRepository.findOneBy({ id });
      const { name, values, type } = updateFieldDto;

      field.name = name;
      field.values = values;
      field.type = type;

      return this.fieldRepository.save(field);
    }

    throw new Error("You can't update field without owner");
  }

  async remove(id: string) {
    if ('user' in this.request) {
      return this.fieldRepository.delete(id);
    }

    throw new Error("You can't update field without owner");
  }
}
