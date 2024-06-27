import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

import {
  dataRowsDtoFactory,
  dataRowsFactory,
} from './factories/data-rows.factory';
import { DataRowController } from './data-row.controller';
import { DataRowService } from './data-row.service';

describe('DataRowController', () => {
  let controller: DataRowController;
  let service: DataRowService;

  const mockedDataRowService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataRowController],
      providers: [{ provide: DataRowService, useValue: mockedDataRowService }],
    }).compile();

    controller = module.get<DataRowController>(DataRowController);
    service = module.get<DataRowService>(DataRowService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new dataRow', async () => {
      const projectId = faker.string.uuid();
      const createDataRowDto = dataRowsDtoFactory.build();
      const mockedDataRow = dataRowsFactory.build();
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockedDataRow);

      const dataRow = await controller.create(projectId, createDataRowDto);
      expect(createSpy).toHaveBeenCalledWith(projectId, createDataRowDto);
      expect(dataRow).toEqual(mockedDataRow);
    });
  });

  describe('update()', () => {
    it('should update an dataRow', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();
      const mockedDataRow = dataRowsFactory.build();
      const updateDataRowDto = dataRowsDtoFactory.build();
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValueOnce(mockedDataRow);

      const dataRow = await controller.update(
        projectId,
        dataRowId,
        updateDataRowDto,
      );
      expect(updateSpy).toHaveBeenCalledWith(
        projectId,
        dataRowId,
        updateDataRowDto,
      );
      expect(dataRow).toEqual(mockedDataRow);
    });
  });

  describe('findAll()', () => {
    it('should return an array of dataRows', async () => {
      const projectId = faker.string.uuid();
      const mockedDataRows = [dataRowsFactory.build(), dataRowsFactory.build()];

      const findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce(mockedDataRows);

      const dataRows = await controller.findAll(projectId);
      expect(findAllSpy).toHaveBeenCalledWith(projectId);
      expect(dataRows).toEqual(mockedDataRows);
    });
  });

  describe('findOne()', () => {
    it('should return a dataRow get by id parameter', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();
      const mockedDataRow = dataRowsFactory.build();

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedDataRow);

      const dataRow = await controller.findOne(projectId, dataRowId);
      expect(findOneSpy).toHaveBeenCalledWith(projectId, dataRowId);
      expect(dataRow).toEqual(mockedDataRow);
    });
  });

  describe('remove()', () => {
    it('should remove a dataRow get by id parameter', async () => {
      const projectId = faker.string.uuid();
      const dataRowId = faker.string.uuid();

      const findOneSpy = jest
        .spyOn(service, 'remove')
        .mockResolvedValueOnce(null);

      const result = await controller.remove(projectId, dataRowId);
      expect(findOneSpy).toHaveBeenCalledWith(projectId, dataRowId);
      expect(result).toEqual(null);
    });
  });
});
