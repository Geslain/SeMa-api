import { Injectable } from '@nestjs/common';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  create(createProjectDto: CreateProjectDto) {
    return `This action adds a new project with ${createProjectDto}`;
  }

  findAll() {
    return `This action returns all projects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project with ${updateProjectDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}