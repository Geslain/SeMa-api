import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { fieldDtoFactory, fieldFactory } from './factories/field.factory';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';

describe('FieldsController', () => {
  let controller: FieldsController;
  let service: FieldsService;
  const mockedFieldService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldsController],
      providers: [
        {
          provide: FieldsService,
          useValue: mockedFieldService,
        },
      ],
    }).compile();

    controller = module.get<FieldsController>(FieldsController);
    service = module.get<FieldsService>(FieldsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new field', async () => {
      const createFieldDto = fieldDtoFactory.build();
      const mockedField = fieldFactory.build();
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockedField);

      const field = await controller.create(createFieldDto);
      expect(createSpy).toHaveBeenCalledWith(createFieldDto);
      expect(field).toEqual(mockedField);
    });
  });

  describe('update()', () => {
    it('should update an field', async () => {
      const fieldId = faker.string.uuid();
      const mockedField = fieldFactory.build();
      const updateFieldDto = fieldDtoFactory.build();
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValueOnce(mockedField);

      const field = await controller.update(fieldId, updateFieldDto);
      expect(updateSpy).toHaveBeenCalledWith(fieldId, updateFieldDto);
      expect(field).toEqual(mockedField);
    });
  });

  describe('findAll()', () => {
    it('should return an array of fields', async () => {
      const mockedFields = [fieldFactory.build(), fieldFactory.build()];

      const findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce(mockedFields);

      const fields = await controller.findAll();
      expect(findAllSpy).toHaveBeenCalledWith();
      expect(fields).toEqual(mockedFields);
    });
  });

  describe('findOne()', () => {
    it('should return a field get by id parameter', async () => {
      const fieldId = faker.string.uuid();
      const mockedField = fieldFactory.build();

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedField);

      const field = await controller.findOne(fieldId);
      expect(findOneSpy).toHaveBeenCalledWith(fieldId);
      expect(field).toEqual(mockedField);
    });
  });

  describe('remove()', () => {
    it('should return a field get by id parameter', async () => {
      const fieldId = faker.string.uuid();

      const findOneSpy = jest
        .spyOn(service, 'remove')
        .mockResolvedValueOnce(null);

      const result = await controller.remove(fieldId);
      expect(findOneSpy).toHaveBeenCalledWith(fieldId);
      expect(result).toEqual(null);
    });
  });
});
