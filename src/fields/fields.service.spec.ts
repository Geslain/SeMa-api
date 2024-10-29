import { REQUEST } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

import { usersFactory } from '../users/factories/users.factory';
import { UsersService } from '../users/users.service';
import { mockRepository } from '../common/tests/mock-repository';

import { fieldsDtoFactory, fieldsFactory } from './factories/fields.factory';
import { Field, FieldType } from './entities/field.entity';
import { FieldsService } from './fields.service';
import { BadFieldValueException } from './fields.error';

describe('FieldsService', () => {
  let service: FieldsService;
  const mockFieldRepository = mockRepository();
  let getOwner;

  const mockUserService = {
    findOneByEmail: jest.fn(),
  };
  const owner = usersFactory.build();

  beforeEach(async () => {
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
      .mockResolvedValue(owner);
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
      const mockedFieldDto = fieldsDtoFactory.build();
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
      const mockedFieldDto = fieldsDtoFactory.build();
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
      const mockedField = fieldsFactory.build({ id: fieldId });
      const mockedFieldDto = fieldsDtoFactory.build();

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
      const mockedField = fieldsFactory.build({ id: fieldId, owner });

      jest
        .spyOn(mockFieldRepository, 'findOne')
        .mockResolvedValueOnce(mockedField);

      const field = await service.findOne(fieldId);
      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockFieldRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: fieldId,
          owner: {
            id: owner.id,
          },
        },
        relations: ['owner'],
      });
      expect(field).toEqual(mockedField);
    });
  });

  describe('findAll()', () => {
    const fieldsArray = [
      fieldsFactory.build(),
      fieldsFactory.build(),
      fieldsFactory.build(),
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

  describe('validate', () => {
    describe('Phone validation', () => {
      const fieldId = faker.string.uuid();
      const mockedField = fieldsFactory.build({
        id: fieldId,
        type: FieldType.PHONE,
      });
      let findOneSpy;

      beforeEach(() => {
        findOneSpy = jest
          .spyOn(service, 'findOne')
          .mockResolvedValue(mockedField);
      });

      afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
      });

      it('should return true', async () => {
        const phoneNumbers = [
          faker.phone.number({ style: 'national' }),
          faker.phone.number({ style: 'international' }),
          faker.phone.number({ style: 'national' }),
          faker.phone.number({ style: 'international' }),
        ];

        const result = await Promise.all(
          phoneNumbers.map((value) => {
            return service.validate(fieldId, value);
          }),
        );

        expect(result.every((v) => v)).toEqual(true);
        expect(findOneSpy).toHaveBeenNthCalledWith(4, fieldId);
      });

      it('should throw exception', async () => {
        for (const value of ['bad phone', 98976567866, '+33']) {
          await expect(service.validate(fieldId, value)).rejects.toThrow(
            new BadFieldValueException('should be a valid phone number'),
          );
        }
      });
    });

    describe('Text validation', () => {
      const fieldId = faker.string.uuid();
      const mockedField = fieldsFactory.build({
        id: fieldId,
        type: FieldType.TEXT,
      });
      let findOneSpy;

      beforeEach(() => {
        findOneSpy = jest
          .spyOn(service, 'findOne')
          .mockResolvedValue(mockedField);
      });

      afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
      });

      it('should return true', async () => {
        const phoneNumbers = ['foo'];

        const result = await Promise.all(
          phoneNumbers.map((value) => {
            return service.validate(fieldId, value);
          }),
        );

        expect(result.every((v) => v)).toEqual(true);
        expect(findOneSpy).toHaveBeenNthCalledWith(1, fieldId);
      });

      it('should throw exception', async () => {
        for (const value of [345678, [], {}]) {
          await expect(service.validate(fieldId, value)).rejects.toThrow(
            new BadFieldValueException('should be a string'),
          );
        }
      });
    });

    describe('List validation', () => {
      const fieldId = faker.string.uuid();
      const mockedField = fieldsFactory.build({
        id: fieldId,
        type: FieldType.LIST,
        values: ['blue', 'red', 'pink'],
      });
      let findOneSpy;

      beforeEach(() => {
        findOneSpy = jest
          .spyOn(service, 'findOne')
          .mockResolvedValue(mockedField);
      });

      afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
      });

      it('should return true', async () => {
        const phoneNumbers = ['blue', 'red', 'pink'];

        const result = await Promise.all(
          phoneNumbers.map((value) => {
            return service.validate(fieldId, value);
          }),
        );

        expect(result.every((v) => v)).toEqual(true);
        expect(findOneSpy).toHaveBeenNthCalledWith(1, fieldId);
      });

      it('should throw exception', async () => {
        for (const value of [345678, 'reed', 'green']) {
          await expect(service.validate(fieldId, value)).rejects.toThrow(
            new BadFieldValueException(
              `should be listed in ${mockedField.name} (${mockedField.values.join(',')})`,
            ),
          );
        }
      });
    });

    describe('Date validation', () => {
      const fieldId = faker.string.uuid();
      const mockedField = fieldsFactory.build({
        id: fieldId,
        type: FieldType.DATE,
      });
      let findOneSpy;

      beforeEach(() => {
        findOneSpy = jest
          .spyOn(service, 'findOne')
          .mockResolvedValue(mockedField);
      });

      afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
      });

      it('should return true', async () => {
        const phoneNumbers = [
          '1994-12-04',
          new Date(),
          faker.date.soon(),
          faker.date.anytime(),
        ];

        const result = await Promise.all(
          phoneNumbers.map((value) => {
            return service.validate(fieldId, value);
          }),
        );

        expect(result.every((v) => v)).toEqual(true);
        expect(findOneSpy).toHaveBeenNthCalledWith(2, fieldId);
      });

      it('should throw exception', async () => {
        for (const value of [123873287287, '2001-31-12', 'Monday']) {
          await expect(service.validate(fieldId, value)).rejects.toThrow(
            new BadFieldValueException('should be a date'),
          );
        }
      });
    });
  });
});
