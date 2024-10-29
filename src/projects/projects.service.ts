import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { UsersService } from '../users/users.service';
import { WithOwnerService } from '../common/with-owner.service';
import { FieldsService } from '../fields/fields.service';
import { DevicesService } from '../devices/devices.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { CreateProjectFieldDto } from './dto/create-project-field.dto';

@Injectable()
export class ProjectsService extends WithOwnerService {
  constructor(
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
    @Inject(REQUEST) protected request: Request,
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(FieldsService) protected fieldsService: FieldsService,
    @Inject(DevicesService) protected devicesService: DevicesService,
    @InjectQueue('message') private messageQueue: Queue,
  ) {
    super(request, usersService);
  }

  async create(createProjectDto: CreateProjectDto) {
    const project = new Project();
    const { deviceId, name, messageTemplate } = createProjectDto;
    project.owner = await this.getOwner();
    project.name = name;
    project.messageTemplate = messageTemplate;
    project.dataRows = [];

    await this.handleDevice(deviceId, project);

    return this.projectsRepository.save(project);
  }

  async findAll() {
    const { id: ownerId } = await this.getOwner();

    return this.projectsRepository.findBy({ owner: { id: ownerId } });
  }

  async findOne(id: string) {
    const { id: ownerId } = await this.getOwner();

    return this.projectsRepository.findOne({
      where: { id, owner: { id: ownerId } },
      relations: ['fields', 'device', 'dataRows'],
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const { deviceId, name, messageTemplate } = updateProjectDto;
    const project = await this.findOne(id);

    if (!project) return null;

    project.name = name;
    project.messageTemplate = messageTemplate;

    await this.handleDevice(deviceId, project);

    return this.projectsRepository.save(project);
  }

  async remove(id: string) {
    const { id: ownerId } = await this.getOwner();

    const result = await this.projectsRepository.delete({
      id,
      owner: { id: ownerId },
    });

    if (result.affected === 0) {
      return null;
    }

    return result;
  }

  async addField(id: string, createProjectFieldDto: CreateProjectFieldDto) {
    const project = await this.findOne(id);

    if (!project) {
      throw new BadRequestException(`Project with id ${id} not found`);
    }

    const fieldId = createProjectFieldDto.fieldId;
    const field = await this.fieldsService.findOne(fieldId);

    if (!field) {
      throw new BadRequestException(`Field with id ${fieldId} not found`);
    }

    if (!Array.isArray(project.fields)) project.fields = [field];
    else if (!project.fields.find((field) => field.id === fieldId)) {
      project.fields.push(field);
    }

    return this.projectsRepository.save(project);
  }

  async findAllFields(id: string) {
    const project = await this.findOne(id);

    if (!project || !project.fields) return [];
    return project.fields;
  }

  async removeField(id: string, fieldId: string) {
    const project = await this.findOne(id);
    if (!project || !project.fields || !project.fields.length) return project;
    project.fields = project.fields.filter((field) => field.id !== fieldId);
    return this.projectsRepository.save(project);
  }

  protected async handleDevice(deviceId: string, project: Project) {
    if (deviceId) {
      const device = await this.devicesService.findOne(deviceId);
      if (!device)
        throw new BadRequestException(`No device found with id ${deviceId}`);

      project.device = device;
    } else if (deviceId === null && project.device) {
      project.device = null;
    }
    return project;
  }

  async sendMessages(projectId: string) {
    const project = await this.findOne(projectId);

    if (!project) return null;

    const { messageTemplate, fields, dataRows, device } = project;

    if (!messageTemplate) {
      throw new BadRequestException(`Message template cannot be null`);
    }

    if (!device) {
      throw new BadRequestException(`No device configured`);
    }

    if (!dataRows || !dataRows.length) {
      throw new BadRequestException(`No data to send`);
    }

    if (!fields.find((f) => f.name === 'phone')) {
      throw new BadRequestException(`Missing required field 'phone'`);
    }

    await this.messageQueue.add('send-messages', project);

    return { status: 'sent' };
  }
}
