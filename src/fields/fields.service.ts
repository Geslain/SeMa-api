import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isDate, isISO8601 } from 'class-validator';

import { UsersService } from '../users/users.service';
import { WithOwnerService } from '../common/with-owner.service';

import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { Field, FieldType } from './entities/field.entity';
import { BadFieldValueException } from './fields.error';

@Injectable()
export class FieldsService extends WithOwnerService {
  constructor(
    @InjectRepository(Field) private fieldRepository: Repository<Field>,
    @Inject(REQUEST) protected request: Request,
    @Inject(UsersService) protected usersService: UsersService,
  ) {
    super(request, usersService);
  }

  async create(createFieldDto: CreateFieldDto) {
    const { name, values, type } = createFieldDto;
    const field = new Field();
    field.name = name;
    field.values = values;
    field.type = type;
    field.owner = await this.getOwner();

    return this.fieldRepository.save(field);
  }

  async findAll() {
    const { id: ownerId } = await this.getOwner();
    return this.fieldRepository.find({
      where: {
        owner: {
          id: ownerId,
        },
      },
      relations: {
        owner: true,
      },
    });
  }

  async findOne(id: string) {
    const { id: ownerId } = await this.getOwner();
    return this.fieldRepository.findOne({
      where: {
        id,
        owner: {
          id: ownerId,
        },
      },
      relations: ['owner'],
    });
  }

  async update(id: string, updateFieldDto: UpdateFieldDto) {
    const { id: ownerId } = await this.getOwner();
    const field = await this.fieldRepository.findOneBy({
      id,
      owner: { id: ownerId },
    });

    if (!field) return null;

    const { name, values, type } = updateFieldDto;

    field.name = name;
    field.values = values;
    field.type = type;

    return this.fieldRepository.save(field);
  }

  async remove(id: string) {
    const { id: ownerId } = await this.getOwner();
    const result = await this.fieldRepository.delete({
      id,
      owner: { id: ownerId },
    });

    if (result.affected === 0) {
      return null;
    }

    return result;
  }

  async validate(id: string, value: any): Promise<boolean> {
    const field = await this.findOne(id);

    switch (field.type) {
      case FieldType.PHONE:
        if (
          typeof value !== 'string' ||
          !value.match(
            /^([+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6})|((([+]?\d{1,3})|0)\s?[0-9]\s?([0-9]{2}\s?){4})$/,
          )
        )
          throw new BadFieldValueException('should be a valid phone number');
        break;
      case FieldType.TEXT:
        if (typeof value !== 'string')
          throw new BadFieldValueException('should be a string');
        break;
      case FieldType.LIST:
        if (!field.values.includes(value))
          throw new BadFieldValueException(
            `should be listed in ${field.name} (${field.values.join(',')})`,
          );
        break;
      case FieldType.DATE:
        if (!isISO8601(value) && !isDate(value))
          throw new BadFieldValueException('should be a date');
        break;
    }
    return true;
  }
}
