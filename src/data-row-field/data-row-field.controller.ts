import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { DataRowFieldService } from './data-row-field.service';
import { CreateDataRowFieldDto } from './dto/create-data-row-field.dto';
import { UpdateDataRowFieldDto } from './dto/update-data-row-field.dto';

@Controller('data-row-field')
export class DataRowFieldController {
  constructor(private readonly dataRowFieldService: DataRowFieldService) {}

  @Post()
  create(@Body() createDataRowFieldDto: CreateDataRowFieldDto) {
    return this.dataRowFieldService.create(createDataRowFieldDto);
  }

  @Get()
  findAll() {
    return this.dataRowFieldService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataRowFieldService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDataRowFieldDto: UpdateDataRowFieldDto,
  ) {
    return this.dataRowFieldService.update(+id, updateDataRowFieldDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataRowFieldService.remove(+id);
  }
}
