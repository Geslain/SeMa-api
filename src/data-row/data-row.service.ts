import { Injectable } from '@nestjs/common';

import { CreateDataRowDto } from './dto/create-data-row.dto';
import { UpdateDataRowDto } from './dto/update-data-row.dto';

@Injectable()
export class DataRowService {
  create(createDataRowDto: CreateDataRowDto) {
    return 'This action adds a new dataRow' + createDataRowDto;
  }

  findAll() {
    return `This action returns all dataRow`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dataRow`;
  }

  update(id: number, updateDataRowDto: UpdateDataRowDto) {
    return `This action updates a #${id} dataRow` + updateDataRowDto;
  }

  remove(id: number) {
    return `This action removes a #${id} dataRow`;
  }
}
