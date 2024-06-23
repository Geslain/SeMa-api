import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { usersDtoFactory, usersFactory } from './factories/users.factory';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  const mockedUserService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockedUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new user', async () => {
      const createUserDto = usersDtoFactory.build();
      const mockedUser = usersFactory.build();
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockedUser);

      const user = await controller.create(createUserDto);
      expect(createSpy).toHaveBeenCalledWith(createUserDto);
      expect(user).toEqual(mockedUser);
    });
  });

  describe('update()', () => {
    it('should update an user', async () => {
      const userId = faker.string.uuid();
      const mockedUser = usersFactory.build();
      const updateUserDto = usersDtoFactory.build();
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValueOnce(mockedUser);

      const user = await controller.update(userId, updateUserDto);
      expect(updateSpy).toHaveBeenCalledWith(userId, updateUserDto);
      expect(user).toEqual(mockedUser);
    });
  });

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      const mockedUsers = [usersFactory.build(), usersFactory.build()];

      const findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce(mockedUsers);

      const users = await controller.findAll();
      expect(findAllSpy).toHaveBeenCalledWith();
      expect(users).toEqual(mockedUsers);
    });
  });

  describe('findOne()', () => {
    it('should return a user get by id parameter', async () => {
      const userId = faker.string.uuid();
      const mockedUser = usersFactory.build();

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockedUser);

      const user = await controller.findOne(userId);
      expect(findOneSpy).toHaveBeenCalledWith(userId);
      expect(user).toEqual(mockedUser);
    });
  });

  describe('remove()', () => {
    it('should return a user get by id parameter', async () => {
      const userId = faker.string.uuid();

      const findOneSpy = jest
        .spyOn(service, 'remove')
        .mockResolvedValueOnce(null);

      const result = await controller.remove(userId);
      expect(findOneSpy).toHaveBeenCalledWith(userId);
      expect(result).toEqual(null);
    });
  });
});
