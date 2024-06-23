import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

import { mockRepository } from '../../../common/tests/mock-repository';

import { DataRowFieldService } from './data-row-field.service';
import { DataRowField } from './entities/data-row-field.entity';
import {
  dataRowFieldsDtoFactory,
  dataRowFieldsFactory,
} from './factories/data-row-fields.factory';

describe('DataRowFieldService', () => {
  let service: DataRowFieldService;
  const mockedDataRowFieldRepository = mockRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataRowFieldService,
        {
          provide: getRepositoryToken(DataRowField),
          useValue: mockedDataRowFieldRepository,
        },
      ],
    }).compile();

    service = module.get<DataRowFieldService>(DataRowFieldService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should insert a new data field row', async () => {
      const mockedDataFieldRowDto = dataRowFieldsDtoFactory.build();
      const dataRowId = faker.string.uuid();

      jest
        .spyOn(mockedDataRowFieldRepository, 'save')
        .mockImplementationOnce((dataRowField) => {
          return Promise.resolve(dataRowField);
        });

      const dataRowField = Object.assign(new DataRowField(), {
        ...mockedDataFieldRowDto,
        dataRowId,
      });

      const newDataFieldRow = await service.create(
        dataRowId,
        mockedDataFieldRowDto,
      );

      expect(dataRowId).toBeDefined();
      expect(mockedDataRowFieldRepository.save).toHaveBeenNthCalledWith(
        1,
        dataRowField,
      );
      expect(newDataFieldRow).toEqual(dataRowField);
    });
  });
  describe('update()', () => {
    it('should return null', async () => {
      const mockedDataFieldRowDto = dataRowFieldsDtoFactory.build();
      const dataRowId = faker.string.uuid();

      jest
        .spyOn(mockedDataRowFieldRepository, 'findOneBy')
        .mockImplementationOnce(() => {
          return Promise.resolve(null);
        });

      const updateDataFieldRow = await service.update(
        dataRowId,
        mockedDataFieldRowDto,
      );

      expect(mockedDataRowFieldRepository.findOneBy).toHaveBeenNthCalledWith(
        1,
        {
          field: { id: mockedDataFieldRowDto.fieldId },
          dataRow: { id: dataRowId },
        },
      );
      expect(mockedDataRowFieldRepository.save).not.toHaveBeenCalled();
      expect(updateDataFieldRow).toEqual(null);
    });

    it('should update an existing data field row', async () => {
      const mockedDataFieldRowDto = dataRowFieldsDtoFactory.build();
      const dataRowId = faker.string.uuid();

      const dataRowField: DataRowField = dataRowFieldsFactory.build();

      jest
        .spyOn(mockedDataRowFieldRepository, 'findOneBy')
        .mockResolvedValueOnce(dataRowField);

      jest
        .spyOn(mockedDataRowFieldRepository, 'save')
        .mockImplementationOnce((drf) => {
          return Promise.resolve(drf);
        });

      const updateDataFieldRow = await service.update(
        dataRowId,
        mockedDataFieldRowDto,
      );

      dataRowField.value = mockedDataFieldRowDto.value;

      expect(mockedDataRowFieldRepository.findOneBy).toHaveBeenNthCalledWith(
        1,
        {
          field: { id: mockedDataFieldRowDto.fieldId },
          dataRow: { id: dataRowId },
        },
      );
      expect(mockedDataRowFieldRepository.save).toHaveBeenNthCalledWith(
        1,
        dataRowField,
      );
      expect(updateDataFieldRow).toEqual(dataRowField);
    });
  });

  describe('findOne()', () => {
    it('should return an existing data row field', async () => {
      const fieldId = faker.string.uuid();
      const dataRowId = faker.string.uuid();

      const mockedDataFieldRow = dataRowFieldsFactory.build({
        fieldId,
        dataRowId,
      });

      jest
        .spyOn(mockedDataRowFieldRepository, 'findOneBy')
        .mockReturnValueOnce(mockedDataFieldRow);

      const dataRowField = service.findOne(dataRowId, fieldId);

      expect(mockedDataRowFieldRepository.findOneBy).toHaveBeenNthCalledWith(
        1,
        {
          field: { id: fieldId },
          dataRow: { id: dataRowId },
        },
      );
      expect(dataRowField).toEqual(mockedDataFieldRow);
    });
  });

  describe('findAll()', () => {
    it('should return all data row field', async () => {
      const dataRowId = faker.string.uuid();

      const mockedDataFieldRowList = dataRowFieldsFactory.buildList(2, {
        dataRowId,
      });

      jest
        .spyOn(mockedDataRowFieldRepository, 'findBy')
        .mockReturnValueOnce(mockedDataFieldRowList);

      const dataRowFieldList = service.findAll(dataRowId);

      expect(mockedDataRowFieldRepository.findBy).toHaveBeenNthCalledWith(1, {
        dataRow: { id: dataRowId },
      });
      expect(dataRowFieldList).toEqual(mockedDataFieldRowList);
    });
  });

  describe('remove()', () => {
    it('should remove an existing data row field', async () => {
      const dataRowId = faker.string.uuid();
      const fieldId = faker.string.uuid();

      jest.spyOn(mockedDataRowFieldRepository, 'delete').mockResolvedValueOnce({
        raw: [],
        affected: 1,
      });

      const dataRowFieldList = await service.remove(dataRowId, fieldId);

      expect(mockedDataRowFieldRepository.delete).toHaveBeenNthCalledWith(1, {
        field: { id: fieldId },
        dataRow: { id: dataRowId },
      });
      expect(dataRowFieldList).toEqual({
        raw: [],
        affected: 1,
      });
    });

    it('should return null', async () => {
      const dataRowId = faker.string.uuid();
      const fieldId = faker.string.uuid();

      jest
        .spyOn(mockedDataRowFieldRepository, 'delete')
        .mockImplementation(() =>
          Promise.resolve({
            raw: [],
            affected: 0,
          }),
        );

      const dataRowFieldList = await service.remove(dataRowId, fieldId);

      expect(mockedDataRowFieldRepository.delete).toHaveBeenNthCalledWith(1, {
        field: { id: fieldId },
        dataRow: { id: dataRowId },
      });
      expect(dataRowFieldList).toEqual(null);
    });
  });
});
