import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { createMockedUser } from './helpers/test';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const createUserDto: CreateUserDto = createMockedUser(1);
  const updateUserDto: UpdateUserDto = createMockedUser(11);
  const userId = '123';
  const mockedUser = createMockedUser(+userId, true);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest
              .fn()
              .mockResolvedValue([
                createMockedUser(1),
                createMockedUser(2),
                createMockedUser(3),
              ]),
            create: jest.fn().mockResolvedValue(createUserDto),
            update: jest.fn().mockResolvedValue(updateUserDto),
            findOne: jest.fn().mockResolvedValue(mockedUser),
            remove: jest.fn().mockResolvedValue(mockedUser),
          },
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
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(createMockedUser(1) as any);

      await controller.create(createUserDto);
      expect(createSpy).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update()', () => {
    it('should update an user', async () => {
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValueOnce(createMockedUser(123) as any);

      await controller.update('123', updateUserDto);
      expect(updateSpy).toHaveBeenCalledWith(123, updateUserDto);
    });
  });

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      await expect(controller.findAll()).resolves.toEqual([
        createMockedUser(1),
        createMockedUser(2),
        createMockedUser(3),
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return a user get by id parameter', async () => {
      await expect(controller.findOne(userId)).resolves.toEqual(
        createMockedUser(+userId, true),
      );
      expect(service.findOne).toHaveBeenCalledWith(+userId);
    });
  });

  describe('remove()', () => {
    it('should return a user get by id parameter', async () => {
      await expect(controller.remove(userId)).resolves.toEqual(
        createMockedUser(+userId, true),
      );
      expect(service.remove).toHaveBeenCalledWith(+userId);
    });
  });
});
