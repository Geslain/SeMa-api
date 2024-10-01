import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { mockRepository } from '../common/tests/mock-repository';

import { User } from './entities/user.entity';
import { usersDtoFactory, usersFactory } from './factories/users.factory';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const mockUserRepository = mockRepository();

  const usersArray = [usersFactory.build(), usersFactory.build()];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initialize()', () => {
    it('should initialize a new user', async () => {
      const mockedUserDto = usersDtoFactory.build();
      const userId = faker.string.uuid();
      const saveSpy = jest
        .spyOn(mockUserRepository, 'save')
        .mockImplementationOnce((user) => {
          user.id = userId;
          return Promise.resolve(user);
        });
      const newUser = await service.initialize(mockedUserDto);

      const savedUser = new User();
      savedUser.email = mockedUserDto.email;
      savedUser.id = userId;

      expect(saveSpy).toHaveBeenCalledWith(savedUser);
      expect(newUser.email).toEqual(mockedUserDto.email);
      expect(newUser.id).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should insert a new user', async () => {
      const mockedUserDto = usersDtoFactory.build();
      const userId = faker.string.uuid();
      jest.spyOn(mockUserRepository, 'save').mockImplementationOnce((user) => {
        user.id = userId;
        return Promise.resolve(user);
      });
      const newUser = await service.create(mockedUserDto);

      const savedUser = new User();
      savedUser.email = mockedUserDto.email;
      savedUser.firstname = mockedUserDto.firstname;
      savedUser.lastname = mockedUserDto.lastname;
      savedUser.id = userId;

      expect(mockUserRepository.save).toHaveBeenNthCalledWith(1, savedUser);
      expect(newUser.firstname).toEqual(mockedUserDto.firstname);
      expect(newUser.lastname).toEqual(mockedUserDto.lastname);
      expect(newUser.email).toEqual(mockedUserDto.email);
      expect(newUser.id).toBeDefined();
    });
  });

  describe('update()', () => {
    it('should return null', async () => {
      const userId = faker.string.uuid();
      const mockedUserDto = usersDtoFactory.build();
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValueOnce(null);

      const updatedUser = await service.update(userId, mockedUserDto);

      expect(updatedUser).toEqual(null);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should update an existing user', async () => {
      const userId = faker.string.uuid();
      const mockedUser = usersFactory.build({ id: userId });
      const mockedUserDto = usersDtoFactory.build();

      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      jest
        .spyOn(mockUserRepository, 'save')
        .mockImplementationOnce((user) => Promise.resolve(user));

      const updatedUser = await service.update(userId, mockedUserDto);

      mockedUser.email = mockedUserDto.email;
      mockedUser.firstname = mockedUserDto.firstname;
      mockedUser.lastname = mockedUserDto.lastname;

      expect(mockUserRepository.save).toHaveBeenNthCalledWith(1, mockedUser);
      expect(updatedUser.firstname).toEqual(mockedUserDto.firstname);
      expect(updatedUser.lastname).toEqual(mockedUserDto.lastname);
      expect(updatedUser.email).toEqual(mockedUserDto.email);
      expect(updatedUser.id).toEqual(userId);
    });
  });

  describe('findOne()', () => {
    it('should return an existing user (by id)', async () => {
      const userId = faker.string.uuid();
      const mockedUser = usersFactory.build();

      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      const user = await service.findOne(userId);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(user).toEqual(mockedUser);
    });
  });

  describe('findOneByEmail()', () => {
    it('should return an existing user (by email)', async () => {
      const mockedUser = usersFactory.build();

      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      const user = await service.findOneByEmail(mockedUser.email);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockedUser.email,
      });
      expect(user).toEqual(mockedUser);
    });
  });

  describe('findAll()', () => {
    it('should return all users', async () => {
      jest.spyOn(mockUserRepository, 'find').mockResolvedValueOnce(usersArray);
      const users = await service.findAll();
      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(users).toEqual(usersArray);
    });
  });

  describe('delete()', () => {
    it('should remove an existing user', async () => {
      const userId = faker.string.uuid();

      jest
        .spyOn(mockUserRepository, 'delete')
        .mockResolvedValueOnce({ raw: [], affected: 1 });

      const removedUser = await service.remove(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(removedUser).toEqual({ raw: [], affected: 1 });
    });

    it('should return null', async () => {
      const userId = faker.string.uuid();

      jest
        .spyOn(mockUserRepository, 'delete')
        .mockResolvedValueOnce({ raw: [], affected: 0 });

      const removedUser = await service.remove(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(removedUser).toEqual(null);
    });
  });
});
