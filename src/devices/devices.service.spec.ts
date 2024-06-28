import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { faker } from '@faker-js/faker';

import { UsersService } from '../users/users.service';
import { mockRepository } from '../common/tests/mock-repository';
import { usersFactory } from '../users/factories/users.factory';
import {
  devicesDtoFactory,
  devicesFactory,
} from '../devices/factories/devices.factory';

import { DevicesService } from './devices.service';
import { Device } from './entities/device.entity';

describe('DevicesService', () => {
  let service: DevicesService;
  const mockDeviceRepository = mockRepository();
  let getOwner;
  const owner = usersFactory.build();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepository,
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: REQUEST,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  beforeEach(() => {
    getOwner = jest
      .spyOn(DevicesService.prototype as any, 'getOwner')
      .mockResolvedValue(Promise.resolve(owner));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should insert a new device', async () => {
      const mockCreateDeviceDto = devicesDtoFactory.build();
      const mockDevice = new Device();
      mockDevice.name = mockCreateDeviceDto.name;
      mockDevice.deviceId = mockCreateDeviceDto.deviceId;
      mockDevice.accessToken = mockCreateDeviceDto.accessToken;
      mockDevice.owner = owner;

      jest
        .spyOn(mockDeviceRepository, 'save')
        .mockImplementation((device) => Promise.resolve(device));

      const result = await service.create(mockCreateDeviceDto);

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockDeviceRepository.save).toHaveBeenCalledWith(mockDevice);
      expect(result).toEqual(mockDevice);
    });
  });
  describe('findAll()', () => {
    it('should return all data rows', async () => {
      const mockedDeviceList = devicesFactory.buildList(2);

      jest
        .spyOn(mockDeviceRepository, 'find')
        .mockReturnValueOnce(mockedDeviceList);

      const result = await service.findAll();

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockDeviceRepository.find).toHaveBeenCalledWith({
        where: { owner: { id: owner.id } },
      });
      expect(result).toEqual(mockedDeviceList);
    });
  });
  describe('findOne()', () => {
    it('should return all data rows', async () => {
      const id = faker.string.uuid();
      const mockedDevice = devicesFactory.build({ id });

      jest
        .spyOn(mockDeviceRepository, 'findOne')
        .mockReturnValueOnce(mockedDevice);

      const result = await service.findOne(id);

      expect(getOwner).toHaveBeenCalledTimes(1);
      expect(mockDeviceRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          owner: {
            id: owner.id,
          },
        },
      });
      expect(result).toEqual(mockedDevice);
    });
  });
  describe('update()', () => {
    it('should return null', async () => {
      const mockDeviceUpdateDto = devicesDtoFactory.build();
      const id = faker.string.uuid();

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(null));

      const result = await service.update(id, mockDeviceUpdateDto);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(mockDeviceRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(null);
    });

    it('should update an existing device', async () => {
      const mockDeviceUpdateDto = devicesDtoFactory.build();
      const id = faker.string.uuid();
      const mockedDevice = devicesFactory.build();

      mockedDevice.name = mockDeviceUpdateDto.name;
      mockedDevice.deviceId = mockDeviceUpdateDto.deviceId;
      mockedDevice.accessToken = mockDeviceUpdateDto.accessToken;

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(mockedDevice));

      const result = await service.update(id, mockDeviceUpdateDto);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(mockDeviceRepository.save).toHaveBeenCalledWith(mockedDevice);
      expect(result).toEqual(mockedDevice);
    });
  });

  describe('remove()', () => {
    it('should return null', async () => {
      const id = faker.string.uuid();

      jest.spyOn(mockDeviceRepository, 'delete').mockResolvedValueOnce({
        raw: [],
        affected: 0,
      });
      const result = await service.remove(id);

      expect(mockDeviceRepository.delete).toHaveBeenCalledWith({
        id,
        owner: { id: owner.id },
      });
      expect(result).toEqual(null);
    });
    it('should return an existing device', async () => {
      const id = faker.string.uuid();

      jest.spyOn(mockDeviceRepository, 'delete').mockResolvedValueOnce({
        raw: [],
        affected: 1,
      });
      const result = await service.remove(id);

      expect(mockDeviceRepository.delete).toHaveBeenCalledWith({
        id,
        owner: { id: owner.id },
      });
      expect(result).toEqual({
        raw: [],
        affected: 1,
      });
    });
  });
});
