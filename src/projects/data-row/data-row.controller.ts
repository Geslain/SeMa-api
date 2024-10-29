import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';

import { DataRowService } from './data-row.service';
import { CreateDataRowDto } from './dto/create-data-row.dto';
import { UpdateDataRowDto } from './dto/update-data-row.dto';
import { DataRowFieldValueValidator } from './data-row-field-value-validator.pipe';

@Controller()
export class DataRowController {
  constructor(private readonly dataRowService: DataRowService) {}

  @Post()
  @UsePipes(DataRowFieldValueValidator)
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createDataRowDto: CreateDataRowDto,
  ) {
    return this.dataRowService.create(projectId, createDataRowDto);
  }

  @Get()
  findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.dataRowService.findAll(projectId);
  }

  @Get(':id')
  findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dataRowService.findOne(projectId, id);
  }

  @Patch(':id')
  @UsePipes(DataRowFieldValueValidator)
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDataRowDto: UpdateDataRowDto,
  ) {
    return this.dataRowService.update(projectId, id, updateDataRowDto);
  }

  @Delete(':id')
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dataRowService.remove(projectId, id);
  }
}
