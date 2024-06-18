import { REQUEST } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

import { userFactory } from '../users/factories/user.factory';
import { UsersService } from '../users/users.service';
import { mockRepository } from '../common/tests/mock-repository';

import { fieldDtoFactory, fieldFactory } from './factories/field.factory';
import { Field } from './entities/field.entity';
import { FieldsService } from './fields.service';

describe('FieldsService', () => {
  let service: FieldsService;
  const mockFieldRepository = mockRepository();
  let getOwner;

  const mockUserService = {
    findOneByEmail: jest.fn(),
  };
  const owner = userFactory.build();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
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
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FieldsService>(FieldsService);

    getOwner = jest
      .spyOn(FieldsService.prototype as any, 'getOwner')
      .mockResolvedValue(Promise.resolve(owner));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

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

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockFieldRepository.save).toHaveBeenNthCalledWith(1, savedField);
      expect(newField.name).toEqual(mockedFieldDto.name);
      expect(newField.values).toEqual(mockedFieldDto.values);
      expect(newField.type).toEqual(mockedFieldDto.type);
      expect(newField.owner).toEqual(owner);
      expect(newField.id).toBeDefined();
    });
  });

  describe('update()', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
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

      expect(getOwner).toHaveBeenCalledTimes(1);
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

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockFieldRepository.save).toHaveBeenNthCalledWith(1, mockedField);
      expect(updatedField.name).toEqual(mockedFieldDto.name);
      expect(updatedField.type).toEqual(mockedFieldDto.type);
      expect(updatedField.values).toEqual(mockedFieldDto.values);
      expect(updatedField.owner).toEqual(mockedField.owner);
      expect(updatedField.id).toEqual(fieldId);
    });
  });

  describe('findOne()', () => {
    it('should return an existing field (by id)', async () => {
      const fieldId = faker.string.uuid();
      const mockedField = fieldFactory.build({ id: fieldId, owner });

      jest
        .spyOn(mockFieldRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedField);

      const field = await service.findOne(fieldId);
      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockFieldRepository.findOneBy).toHaveBeenCalledWith({
        id: fieldId,
        owner: { id: owner.id },
      });
      expect(field).toEqual(mockedField);
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
      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockFieldRepository.find).toHaveBeenCalled();
      expect(fields).toEqual(fieldsArray);
    });
  });

  describe('remove()', () => {
    it('should remove an existing field', async () => {
      const fieldId = faker.string.uuid();

      jest
        .spyOn(mockFieldRepository, 'delete')
        .mockResolvedValueOnce({ raw: [], affected: 1 });

      const removedField = await service.remove(fieldId);
      expect(mockFieldRepository.delete).toHaveBeenCalledWith({
        id: fieldId,
        owner: { id: owner.id },
      });
      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(removedField).toEqual({ raw: [], affected: 1 });
    });

    it('should return null', async () => {
      const fieldId = faker.string.uuid();

      jest
        .spyOn(mockFieldRepository, 'delete')
        .mockResolvedValueOnce({ raw: [], affected: 0 });

      const removedField = await service.remove(fieldId);
      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockFieldRepository.delete).toHaveBeenCalledWith({
        id: fieldId,
        owner: { id: owner.id },
      });
      expect(removedField).toEqual(null);
    });
  });
});
