import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { DataRowService } from './data-row.service';
import { CreateDataRowDto } from './dto/create-data-row.dto';
import { UpdateDataRowDto } from './dto/update-data-row.dto';

@Controller('data-row')
export class DataRowController {
  constructor(private readonly dataRowService: DataRowService) {}

  @Post()
  create(@Body() createDataRowDto: CreateDataRowDto) {
    return this.dataRowService.create(createDataRowDto);
  }

  @Get()
  findAll() {
    return this.dataRowService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataRowService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDataRowDto: UpdateDataRowDto) {
    return this.dataRowService.update(+id, updateDataRowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataRowService.remove(+id);
  }
}
