import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FieldsService } from '../../fields/fields.service';
import { ProjectsService } from '../projects.service';

import { CreateDataRowDto } from './dto/create-data-row.dto';
import { UpdateDataRowDto } from './dto/update-data-row.dto';
import { DataRow } from './entities/data-row.entity';
import { DataRowField } from './data-row-field/entities/data-row-field.entity';
import { DataRowFieldService } from './data-row-field/data-row-field.service';

@Injectable()
export class DataRowService {
  constructor(
    @InjectRepository(DataRow) private dataRowRepository: Repository<DataRow>,
    @Inject(FieldsService) private fieldsService: FieldsService,
    @Inject(ProjectsService) private projectsService: ProjectsService,
    @Inject(DataRowFieldService)
    private dataRowFieldsService: DataRowFieldService,
  ) {}
  async create(projectId: string, createDataRowDto: CreateDataRowDto) {
    const dataRow = new DataRow();
    dataRow.project = await this.projectsService.findOne(projectId);

    if (!dataRow.project) return null;

    dataRow.fields = await Promise.all(
      createDataRowDto.fields.map(async (dataRowField) => {
        const { fieldId, value } = dataRowField;
        if (!fieldId)
          // Throw error if field id is missing
          throw new BadRequestException(`Field id can't be null`);
        const field = await this.fieldsService.findOne(dataRowField.fieldId);
        if (!field)
          // Throw error if field does not exist
          throw new BadRequestException(
            `Field does not exist for field with id ${dataRowField.fieldId}`,
          );
        return Object.assign({ value, field }, new DataRowField());
      }),
    );

    return this.dataRowRepository.save(dataRow);
  }

  findAll(projectId: string) {
    return this.dataRowRepository.find({
      where: { project: { id: projectId } },
    });
  }

  findOne(projectId: string, id: string) {
    return this.dataRowRepository.findOne({
      where: { id, project: { id: projectId } },
      relations: {
        fields: {
          field: true,
        },
      },
    });
  }

  async update(
    projectId: string,
    id: string,
    updateDataRowDto: UpdateDataRowDto,
  ) {
    const dataRow = await this.dataRowRepository.findOneBy({
      id,
      project: { id: projectId },
    });

    if (!dataRow) return null;

    // For every field we have to use data row field service function, we cannot use the save function
    // like we did on create because there are several known issues with composite primary key
    // see https://github.com/typeorm/typeorm/issues/10450
    for (const dataRowField of updateDataRowDto.fields) {
      const existingDataRow = dataRow.fields.find(
        (drf) => drf.fieldId === dataRowField.fieldId,
      );

      if (existingDataRow) {
        existingDataRow.value = dataRowField.value;
        await this.dataRowFieldsService.update(id, dataRowField);
      } else {
        await this.dataRowFieldsService.create(id, dataRowField);
      }
    }

    return await this.dataRowRepository.findOneBy({
      id,
      project: { id: projectId },
    });
  }

  async remove(projectId: string, id: string) {
    const result = await this.dataRowRepository.delete({
      id,
      project: { id: projectId },
    });

    if (result.affected === 0) {
      return null;
    }

    return result;
  }
}
