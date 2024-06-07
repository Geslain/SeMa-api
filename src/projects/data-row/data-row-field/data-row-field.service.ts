import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDataRowFieldDto } from './dto/create-data-row-field.dto';
import { UpdateDataRowFieldDto } from './dto/update-data-row-field.dto';
import { DataRowField } from './entities/data-row-field.entity';

@Injectable()
export class DataRowFieldService {
  constructor(
    @InjectRepository(DataRowField)
    private readonly dataRowFieldRepository: Repository<DataRowField>,
  ) {}
  create(dataRowId: string, createDataRowFieldDto: CreateDataRowFieldDto) {
    const dataRowField = Object.assign(new DataRowField(), {
      ...createDataRowFieldDto,
      dataRowId,
    });
    return this.dataRowFieldRepository.save(dataRowField);
  }

  findAll(dataRowId: string) {
    return this.dataRowFieldRepository.findOneBy({
      dataRow: { id: dataRowId },
    });
  }

  findOne(dataRowId: string, fieldId: string) {
    return this.dataRowFieldRepository.findOneBy({
      field: { id: fieldId },
      dataRow: { id: dataRowId },
    });
  }

  async update(
    dataRowId: string,
    updateDataRowFieldDto: UpdateDataRowFieldDto,
  ) {
    const dataRowField = await this.dataRowFieldRepository.findOneBy({
      field: { id: updateDataRowFieldDto.fieldId },
      dataRow: { id: dataRowId },
    });

    dataRowField.value = updateDataRowFieldDto.value;

    return this.dataRowFieldRepository.save(dataRowField);
  }

  async remove(dataRowId: string, fieldId: string) {
    const result = await this.dataRowFieldRepository.delete({
      field: { id: fieldId },
      dataRow: { id: dataRowId },
    });

    if (result.affected === 0) {
      return null;
    }

    return result;
  }
}
