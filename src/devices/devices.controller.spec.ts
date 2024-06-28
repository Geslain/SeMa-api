import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

import { devicesDtoFactory, devicesFactory } from './factories/devices.factory';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

describe('DevicesController', () => {
  let controller: DevicesController;
  let service: DevicesService;

  const mockedDeviceService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        DevicesService,
        { provide: DevicesService, useValue: mockedDeviceService },
      ],
    }).compile();

    controller = module.get<DevicesController>(DevicesController);
    service = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new device', async () => {
      const createDeviceDto = devicesDtoFactory.build();
      const mockedDevice = devicesFactory.build();
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockedDevice);

      const device = await controller.create(createDeviceDto);
      expect(createSpy).toHaveBeenCalledWith(createDeviceDto);
      expect(device).toEqual(mockedDevice);
    });
  });

  describe('update()', () => {
    it('should update an device', async () => {
      const deviceId = faker.string.uuid();
      const mockedDevice = devicesFactory.build();
      const updateDeviceDto = devicesDtoFactory.build();
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValueOnce(mockedDevice);

      const device = await controller.update(deviceId, updateDeviceDto);
      expect(updateSpy).toHaveBeenCalledWith(deviceId, updateDeviceDto);
      expect(device).toEqual(mockedDevice);
    });
  });

  describe('findAll()', () => {
    it('should return an array of devices', async () => {
      const mockedDevices = [devicesFactory.build(), devicesFactory.build()];

      const findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce(mockedDevices);

      const devices = await controller.findAll();
      expect(findAllSpy).toHaveBeenCalledWith();
      expect(devices).toEqual(mockedDevices);
    });
  });

  describe('findOne()', () => {
    it('should return a device get by id parameter', async () => {
      const deviceId = faker.string.uuid();
      const mockedDevice = devicesFactory.build();

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedDevice);

      const device = await controller.findOne(deviceId);
      expect(findOneSpy).toHaveBeenCalledWith(deviceId);
      expect(device).toEqual(mockedDevice);
    });
  });

  describe('remove()', () => {
    it('should remove a device get by id parameter', async () => {
      const deviceId = faker.string.uuid();

      const remove = jest.spyOn(service, 'remove').mockResolvedValueOnce(null);

      const result = await controller.remove(deviceId);
      expect(remove).toHaveBeenCalledWith(deviceId);
      expect(result).toEqual(null);
    });
  });
});
