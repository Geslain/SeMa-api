import { Injectable } from '@nestjs/common';

import { CreateDataRowFieldDto } from './dto/create-data-row-field.dto';
import { UpdateDataRowFieldDto } from './dto/update-data-row-field.dto';

@Injectable()
export class DataRowFieldService {
  create(createDataRowFieldDto: CreateDataRowFieldDto) {
    return 'This action adds a new dataRowField' + createDataRowFieldDto;
  }

  findAll() {
    return `This action returns all dataRowField`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dataRowField`;
  }

  update(id: number, updateDataRowFieldDto: UpdateDataRowFieldDto) {
    return `This action updates a #${id} dataRowField` + updateDataRowFieldDto;
  }

  remove(id: number) {
    return `This action removes a #${id} dataRowField`;
  }
}
