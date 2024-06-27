import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';

import { UsersService } from '../users/users.service';
import { WithOwnerService } from '../common/WithOwnerService';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService extends WithOwnerService {
  constructor(
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
    @Inject(REQUEST) protected request: Request,
    @Inject(UsersService) protected usersService: UsersService,
  ) {
    super(request, usersService);
  }

  async create(createProjectDto: CreateProjectDto) {
    const project = new Project();
    project.owner = await this.getOwner();
    project.name = createProjectDto.name;
    project.dataRows = [];

    return this.projectsRepository.save(project);
  }

  async findAll() {
    const { id: ownerId } = await this.getOwner();

    return this.projectsRepository.findBy({ owner: { id: ownerId } });
  }

  async findOne(id: string) {
    const { id: ownerId } = await this.getOwner();

    return this.projectsRepository.findOneBy({ id, owner: { id: ownerId } });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const { id: ownerId } = await this.getOwner();

    const project = await this.projectsRepository.findOneBy({
      id,
      owner: { id: ownerId },
    });

    if (!project) return null;

    project.name = updateProjectDto.name;

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
}
