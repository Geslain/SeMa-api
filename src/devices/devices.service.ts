import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';

import { WithOwnerService } from '../common/WithOwnerService';
import { UsersService } from '../users/users.service';

import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';

@Injectable()
export class DevicesService extends WithOwnerService {
  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @Inject(REQUEST) protected request: Request,
    @Inject(UsersService) protected usersService: UsersService,
  ) {
    super(request, usersService);
  }
  async create(createDeviceDto: CreateDeviceDto) {
    const owner = await this.getOwner();
    const device = Object.assign(new Device(), createDeviceDto);
    device.owner = owner;
    return this.deviceRepository.save(device);
  }

  async findAll() {
    const owner = await this.getOwner();

    return this.deviceRepository.find({ where: { owner: { id: owner.id } } });
  }

  async findOne(id: string) {
    const owner = await this.getOwner();

    return this.deviceRepository.findOne({
      where: { owner: { id: owner.id }, id },
    });
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.findOne(id);
    if (!device) return null;
    const updatedDevice = Object.assign(device, updateDeviceDto);
    return this.deviceRepository.save(updatedDevice);
  }

  async remove(id: string) {
    const owner = await this.getOwner();

    const result = await this.deviceRepository.delete({
      id,
      owner: { id: owner.id },
    });

    if (result.affected === 0) {
      return null;
    }

    return result;
  }
}
