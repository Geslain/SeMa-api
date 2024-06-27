import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { mockRepository } from '../../common/tests/mock-repository';
import { FieldsService } from '../../fields/fields.service';
import { ProjectsService } from '../projects.service';
import { projectFactory } from '../factories/projects.factory';
import { fieldsFactory } from '../../fields/factories/fields.factory';

import { DataRowService } from './data-row.service';
import { DataRow } from './entities/data-row.entity';
import { DataRowFieldService } from './data-row-field/data-row-field.service';
import {
  dataRowsDtoFactory,
  dataRowsFactory,
} from './factories/data-rows.factory';
import { dataRowFieldsDtoFactory } from './data-row-field/factories/data-row-fields.factory';
import { DataRowField } from './data-row-field/entities/data-row-field.entity';

describe('DataRowService', () => {
  let service: DataRowService;
  const mockedDataRowRepository = mockRepository();
  const mockedFieldService = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const mockedProjectService = {
    findOne: jest.fn(),
  };
  const mockedDataRowFieldsService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataRowService,
        {
          provide: getRepositoryToken(DataRow),
          useValue: mockedDataRowRepository,
        },
        {
          provide: FieldsService,
          useValue: mockedFieldService,
        },
        {
          provide: ProjectsService,
          useValue: mockedProjectService,
        },
        {
          provide: DataRowFieldService,
          useValue: mockedDataRowFieldsService,
        },
      ],
    }).compile();

    service = module.get<DataRowService>(DataRowService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should return null', async () => {
      const projectId = faker.string.uuid();
      const createDataRowDto = dataRowsDtoFactory.build();

      jest.spyOn(mockedProjectService, 'findOne').mockResolvedValueOnce(null);

      const newDataRow = await service.create(projectId, createDataRowDto);

      expect(mockedProjectService.findOne).toHaveBeenNthCalledWith(
        1,
        projectId,
      );
      expect(newDataRow).toBe(null);
      expect(mockedDataRowRepository.save).not.toHaveBeenCalled();
      expect(mockedFieldService.findOne).not.toHaveBeenCalled();
    });

    it('should throw an error if field id is missing', async () => {
      const projectId = faker.string.uuid();
      const project = projectFactory.build({ id: projectId });
      const fields = [
        dataRowFieldsDtoFactory.build({ fieldId: null }),
        dataRowFieldsDtoFactory.build(),
      ];
      const createDataRowDto = dataRowsDtoFactory.build(
        {},
        {
          associations: {
            fields,
          },
        },
      );

      jest
        .spyOn(mockedProjectService, 'findOne')
        .mockResolvedValueOnce(project);

      await expect(
        async () => await service.create(projectId, createDataRowDto),
      ).rejects.toThrow(new BadRequestException("Field id can't be null"));
      expect(mockedProjectService.findOne).toHaveBeenNthCalledWith(
        1,
        projectId,
      );
      expect(mockedFieldService.findOne).toHaveBeenNthCalledWith(
        1,
        fields[1].fieldId,
      );
      expect(mockedDataRowRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if field is missing', async () => {
      const projectId = faker.string.uuid();
      const project = projectFactory.build({ id: projectId });
      const fields = [
        dataRowFieldsDtoFactory.build(),
        dataRowFieldsDtoFactory.build(),
      ];
      const createDataRowDto = dataRowsDtoFactory.build(
        {},
        {
          associations: {
            fields,
          },
        },
      );

      jest
        .spyOn(mockedProjectService, 'findOne')
        .mockResolvedValueOnce(project);

      jest.spyOn(mockedFieldService, 'findOne').mockResolvedValueOnce(null);

      await expect(
        async () => await service.create(projectId, createDataRowDto),
      ).rejects.toThrow(
        new BadRequestException(
          `Field does not exist for field with id ${fields[0].fieldId}`,
        ),
      );
      expect(mockedProjectService.findOne).toHaveBeenNthCalledWith(
        1,
        projectId,
      );
      expect(mockedFieldService.findOne).toHaveBeenNthCalledWith(
        1,
        fields[0].fieldId,
      );
      expect(mockedDataRowRepository.save).not.toHaveBeenCalled();
    });

    it('should insert a new data row', async () => {
      const projectId = faker.string.uuid();
      const project = projectFactory.build({ id: projectId });
      const dataRowFields = [
        dataRowFieldsDtoFactory.build(),
        dataRowFieldsDtoFactory.build(),
      ];

      const fields = {
        [dataRowFields[0].fieldId]: fieldsFactory.build(),
        [dataRowFields[1].fieldId]: fieldsFactory.build(),
      };
      const createDataRowDto = dataRowsDtoFactory.build(
        {},
        {
          associations: {
            fields: dataRowFields,
          },
        },
      );

      const dataRow = new DataRow();
      dataRow.project = project;
      dataRow.fields = Object.values(fields).map((field, i) => {
        return Object.assign(
          { field, value: dataRowFields[i].value },
          new DataRowField(),
        );
      });

      jest
        .spyOn(mockedProjectService, 'findOne')
        .mockResolvedValueOnce(project);

      jest
        .spyOn(mockedFieldService, 'findOne')
        .mockImplementation((fieldId) => Promise.resolve(fields[fieldId]));

      jest
        .spyOn(mockedDataRowRepository, 'save')
        .mockImplementation((dr) => dr);

      const newDataRow = await service.create(projectId, createDataRowDto);

      expect(mockedProjectService.findOne).toHaveBeenNthCalledWith(
        1,
        projectId,
      );
      expect(mockedFieldService.findOne).toHaveBeenCalledTimes(2);
      expect(mockedFieldService.findOne).toHaveBeenNthCalledWith(
        1,
        dataRowFields[0].fieldId,
      );
      expect(mockedFieldService.findOne).toHaveBeenNthCalledWith(
        2,
        dataRowFields[1].fieldId,
      );

      expect(mockedDataRowRepository.save).toHaveBeenNthCalledWith(1, dataRow);
      expect(newDataRow).toStrictEqual(dataRow);
    });
  });

  describe('findAll()', () => {
    it('should return all data rows', async () => {
      const projectId = faker.string.uuid();
      const mockedDataRowList = dataRowsFactory.buildList(2);

      jest
        .spyOn(mockedDataRowRepository, 'find')
        .mockReturnValueOnce(mockedDataRowList);

      const dataRowList = await service.findAll(projectId);

      expect(mockedDataRowRepository.find).toHaveBeenCalledWith({
        where: { project: { id: projectId } },
      });
      expect(dataRowList).toBe(mockedDataRowList);
    });
  });

  describe('findOne()', () => {
    it('should return an existing data row', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();
      const mockedDataRow = dataRowsFactory.build();

      jest
        .spyOn(mockedDataRowRepository, 'findOne')
        .mockReturnValueOnce(mockedDataRow);

      const dataRow = await service.findOne(projectId, dataRowId);

      expect(mockedDataRowRepository.findOne).toHaveBeenCalledWith({
        where: { id: dataRowId, project: { id: projectId } },
        relations: {
          fields: {
            field: true,
          },
        },
      });
      expect(dataRow).toBe(mockedDataRow);
    });
  });

  describe('update()', () => {
    it('should return null', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();
      const updateDataRowDto = dataRowsDtoFactory.build();

      jest
        .spyOn(mockedDataRowRepository, 'findOneBy')
        .mockResolvedValueOnce(null);

      const updatedDataRow = await service.update(
        projectId,
        dataRowId,
        updateDataRowDto,
      );

      expect(mockedDataRowRepository.findOneBy).toHaveBeenCalledWith({
        id: dataRowId,
        project: { id: projectId },
      });
      expect(updatedDataRow).toBe(null);
    });

    it('should update a data row by creating a new data row field', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();
      const dataRowFields = [];
      const dataRow = dataRowsFactory.build({
        id: dataRowId,
        fields: dataRowFields,
      });
      const updateDataRowDto = dataRowsDtoFactory.build();
      const returnResult = Object.assign(new DataRow(), dataRow);
      returnResult.fields = updateDataRowDto.fields.map((drf) => {
        return Object.assign(new DataRowField(), drf);
      });

      jest
        .spyOn(mockedDataRowRepository, 'findOneBy')
        .mockResolvedValueOnce(dataRow);
      jest
        .spyOn(mockedDataRowRepository, 'findOneBy')
        .mockResolvedValueOnce(returnResult);

      const updatedDataRow = await service.update(
        projectId,
        dataRowId,
        updateDataRowDto,
      );

      expect(mockedDataRowRepository.findOneBy).toHaveBeenCalledWith({
        id: dataRowId,
        project: { id: projectId },
      });
      expect(mockedDataRowFieldsService.update).not.toHaveBeenCalled();
      expect(mockedDataRowFieldsService.create).toHaveBeenCalledTimes(
        updateDataRowDto.fields.length,
      );
      updateDataRowDto.fields.forEach((field, i) => {
        expect(mockedDataRowFieldsService.create).toHaveBeenNthCalledWith(
          i + 1,
          dataRowId,
          field,
        );
      });
      expect(updatedDataRow).toBe(returnResult);
    });
    it('should update a data row by updating an existing data row field and create non existing', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();
      const updateDataRowDto = dataRowsDtoFactory.build();

      const dataRow = dataRowsFactory.build({
        id: dataRowId,
        fields: [Object.assign(new DataRowField(), updateDataRowDto.fields[0])],
      });
      const returnResult = Object.assign(new DataRow(), dataRow);
      returnResult.fields = [
        ...dataRow.fields,
        Object.assign(new DataRowField(), updateDataRowDto.fields[0]),
      ];

      jest
        .spyOn(mockedDataRowRepository, 'findOneBy')
        .mockResolvedValueOnce(dataRow);
      jest
        .spyOn(mockedDataRowRepository, 'findOneBy')
        .mockResolvedValueOnce(returnResult);

      const updatedDataRow = await service.update(
        projectId,
        dataRowId,
        updateDataRowDto,
      );

      expect(mockedDataRowRepository.findOneBy).toHaveBeenCalledWith({
        id: dataRowId,
        project: { id: projectId },
      });
      expect(mockedDataRowFieldsService.update).toHaveBeenCalledTimes(1);
      expect(mockedDataRowFieldsService.create).toHaveBeenCalledTimes(1);
      expect(mockedDataRowFieldsService.create).toHaveBeenNthCalledWith(
        1,
        dataRowId,
        updateDataRowDto.fields[1],
      );
      expect(updatedDataRow).toBe(returnResult);
    });
    it('should throw an error if try to create a new data row field with an inexistant field id', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();
      const updateDataRowDto = dataRowsDtoFactory.build();

      const dataRow = dataRowsFactory.build({
        id: dataRowId,
        fields: [],
      });

      jest
        .spyOn(mockedDataRowRepository, 'findOneBy')
        .mockResolvedValueOnce(dataRow);

      jest
        .spyOn(mockedDataRowFieldsService, 'create')
        .mockImplementationOnce(() => {
          throw new QueryFailedError('', [], new Error());
        });

      await expect(
        async () =>
          await service.update(projectId, dataRowId, updateDataRowDto),
      ).rejects.toThrow(
        new BadRequestException(
          `Field with id ${updateDataRowDto.fields[0].fieldId} does not exists`,
        ),
      );

      expect(mockedDataRowRepository.findOneBy).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove()', () => {
    it('should remove an existing data row field', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();

      jest.spyOn(mockedDataRowRepository, 'delete').mockResolvedValueOnce({
        raw: [],
        affected: 1,
      });

      const dataRowFieldList = await service.remove(projectId, dataRowId);

      expect(mockedDataRowRepository.delete).toHaveBeenNthCalledWith(1, {
        id: dataRowId,
        project: { id: projectId },
      });
      expect(dataRowFieldList).toEqual({
        raw: [],
        affected: 1,
      });
    });

    it('should return null', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();

      jest.spyOn(mockedDataRowRepository, 'delete').mockImplementation(() =>
        Promise.resolve({
          raw: [],
          affected: 0,
        }),
      );

      const dataRowFieldList = await service.remove(projectId, dataRowId);

      expect(mockedDataRowRepository.delete).toHaveBeenNthCalledWith(1, {
        id: dataRowId,
        project: { id: projectId },
      });
      expect(dataRowFieldList).toEqual(null);
    });
  });
});
