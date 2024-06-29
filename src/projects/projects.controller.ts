import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { CreateProjectFieldDto } from './dto/create-project-field.dto';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }

  // Fields

  @Post('/:projectId/fields')
  addField(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createProjectFieldDto: CreateProjectFieldDto,
  ) {
    return this.projectsService.addField(projectId, createProjectFieldDto);
  }

  @Get('/:projectId/fields')
  findAllFields(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.projectsService.findAllFields(projectId);
  }

  @Delete('/:projectId/fields/:fieldId')
  removeField(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
  ) {
    return this.projectsService.removeField(projectId, fieldId);
  }

  // SendMessage
  @Post('/:projectId/send-messages')
  sendMessages(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.projectsService.sendMessages(projectId);
  }
}
