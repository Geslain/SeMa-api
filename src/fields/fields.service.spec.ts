import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

import { userFactory } from '../users/factories/user.factory';
import { MissingUserError } from '../common/errors';
import { UsersService } from '../users/users.service';

import { fieldDtoFactory, fieldFactory } from './factories/field.factory';
import { Field } from './entities/field.entity';
import { FieldsService } from './fields.service';

describe('FieldsService', () => {
  let service: FieldsService;
  const mockFieldRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserService = {
    findOneByEmail: jest.fn(),
  };

  function createModule(requestMockValue = {}) {
    return Test.createTestingModule({
      providers: [
        FieldsService,
        {
          provide: getRepositoryToken(Field),
          useValue: mockFieldRepository,
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: REQUEST,
          useValue: requestMockValue,
        },
      ],
    }).compile();
  }

  const owner = userFactory.build();
  let mockRequest;

  beforeEach(async () => {
    mockRequest = {
      user: owner,
    };

    const module: TestingModule = await createModule(mockRequest);
    service = module.get<FieldsService>(FieldsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should insert a new field', async () => {
      const mockedFieldDto = fieldDtoFactory.build();
      const fieldId = faker.string.uuid();
      jest
        .spyOn(mockFieldRepository, 'save')
        .mockImplementationOnce((field) => {
          field.id = fieldId;
          return Promise.resolve(field);
        });
      jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValueOnce(Promise.resolve(owner));
      const newField = await service.create(mockedFieldDto);

      const savedField = new Field();
      savedField.name = mockedFieldDto.name;
      savedField.type = mockedFieldDto.type;
      savedField.values = mockedFieldDto.values;
      savedField.owner = owner;
      savedField.id = fieldId;

      expect(mockFieldRepository.save).toHaveBeenNthCalledWith(1, savedField);
      expect(newField.name).toEqual(mockedFieldDto.name);
      expect(newField.values).toEqual(mockedFieldDto.values);
      expect(newField.type).toEqual(mockedFieldDto.type);
      expect(newField.owner).toEqual(owner);
      expect(newField.id).toBeDefined();
    });

    it('should throw and error', async () => {
      const mockedFieldDto = fieldDtoFactory.build();
      service = (await createModule()).get<FieldsService>(FieldsService);

      expect(() => service.create(mockedFieldDto)).rejects.toThrow(
        MissingUserError,
      );
    });
  });

  describe('update()', () => {
    it('should return null', async () => {
      const fieldId = faker.string.uuid();
      const mockedFieldDto = fieldDtoFactory.build();
      jest
        .spyOn(mockFieldRepository, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(null));
      jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValueOnce(Promise.resolve(owner));

      const updatedField = await service.update(fieldId, mockedFieldDto);

      expect(updatedField).toEqual(null);
      expect(mockFieldRepository.save).not.toHaveBeenCalled();
    });

    it('should update an existing field', async () => {
      const fieldId = faker.string.uuid();
      const mockedField = fieldFactory.build({ id: fieldId });
      const mockedFieldDto = fieldDtoFactory.build();

      jest
        .spyOn(mockFieldRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedField);

      jest
        .spyOn(mockFieldRepository, 'save')
        .mockImplementationOnce((field) => Promise.resolve(field));

      const updatedField = await service.update(fieldId, mockedFieldDto);

      mockedField.name = mockedFieldDto.name;
      mockedField.type = mockedFieldDto.type;
      mockedField.values = mockedFieldDto.values;

      expect(mockFieldRepository.save).toHaveBeenNthCalledWith(1, mockedField);
      expect(updatedField.name).toEqual(mockedFieldDto.name);
      expect(updatedField.type).toEqual(mockedFieldDto.type);
      expect(updatedField.values).toEqual(mockedFieldDto.values);
      expect(updatedField.owner).toEqual(mockedField.owner);
      expect(updatedField.id).toEqual(fieldId);
    });

    it('should throw and error', async () => {
      const fieldId = faker.string.uuid();
      const mockedFieldDto = fieldDtoFactory.build();
      service = (await createModule()).get<FieldsService>(FieldsService);

      await expect(
        async () => await service.update(fieldId, mockedFieldDto),
      ).rejects.toThrow(MissingUserError);
    });
  });

  describe('findOne()', () => {
    it('should return an existing field (by id)', async () => {
      const fieldId = faker.string.uuid();
      const mockedField = fieldFactory.build();

      jest
        .spyOn(mockFieldRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedField);

      const field = await service.findOne(fieldId);
      expect(mockFieldRepository.findOneBy).toHaveBeenCalledWith({
        id: fieldId,
      });
      expect(field).toEqual(mockedField);
    });

    it('should throw and error', async () => {
      const fieldId = faker.string.uuid();
      service = (await createModule()).get<FieldsService>(FieldsService);

      await expect(async () => await service.findOne(fieldId)).rejects.toThrow(
        MissingUserError,
      );
    });
  });

  describe('findAll()', () => {
    const fieldsArray = [
      fieldFactory.build(),
      fieldFactory.build(),
      fieldFactory.build(),
    ];
    it('should return all fields', async () => {
      jest
        .spyOn(mockFieldRepository, 'find')
        .mockResolvedValueOnce(fieldsArray);
      const fields = await service.findAll();
      expect(mockFieldRepository.find).toHaveBeenCalled();
      expect(fields).toEqual(fieldsArray);
    });

    it('should throw and error', async () => {
      service = (await createModule()).get<FieldsService>(FieldsService);

      await expect(async () => await service.findAll()).rejects.toThrow(
        MissingUserError,
      );
    });
  });

  describe('delete()', () => {
    it('should remove an existing field', async () => {
      const fieldId = faker.string.uuid();

      jest
        .spyOn(mockFieldRepository, 'delete')
        .mockResolvedValueOnce({ raw: [], affected: 1 });

      const removedField = await service.remove(fieldId);
      expect(mockFieldRepository.delete).toHaveBeenCalledWith(fieldId);
      expect(removedField).toEqual({ raw: [], affected: 1 });
    });

    it('should remove return null', async () => {
      const fieldId = faker.string.uuid();

      jest
        .spyOn(mockFieldRepository, 'delete')
        .mockResolvedValueOnce({ raw: [], affected: 0 });

      const removedField = await service.remove(fieldId);
      expect(mockFieldRepository.delete).toHaveBeenCalledWith(fieldId);
      expect(removedField).toEqual(null);
    });

    it('should throw and error', async () => {
      const fieldId = faker.string.uuid();
      service = (await createModule()).get<FieldsService>(FieldsService);

      await expect(async () => await service.remove(fieldId)).rejects.toThrow(
        MissingUserError,
      );
    });
  });
});
