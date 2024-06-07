import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { WithOwnerService } from '../common/WithOwnerService';

import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { Field } from './entities/field.entity';

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
    return this.fieldRepository.findOneBy({ id, owner: { id: ownerId } });
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
}
