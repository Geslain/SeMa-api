import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { createMockedUser } from './helpers/test';
import { UsersService } from './users.service';

const mockUser = createMockedUser(1);

describe('UsersService', () => {
  let service: UsersService;
  const mockUserRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  const usersArray = [createMockedUser(1), createMockedUser(2)];

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should insert a new user', async () => {
    jest
      .spyOn(mockUserRepository, 'save')
      .mockImplementationOnce(() => Promise.resolve(mockUser as any));
    const newUser = await service.create(mockUser);
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    expect(newUser).toEqual(mockUser);
  });

  it('should update an existing user', async () => {
    const userId = 1;
    jest.spyOn(mockUserRepository, 'save').mockResolvedValueOnce(mockUser);
    const updatedUser = await service.update(userId, mockUser);
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    expect(updatedUser).toEqual(mockUser);
  });

  it('should return an existing user (by id)', async () => {
    const userId = 1;
    jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValueOnce(mockUser);

    const user = await service.findOne(userId);
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    expect(user).toEqual(mockUser);
  });

  it('should return an existing user (by email)', async () => {
    jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValueOnce(mockUser);

    const user = await service.findOneByEmail(mockUser.email);
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      email: mockUser.email,
    });
    expect(user).toEqual(mockUser);
  });

  it('should return all users', async () => {
    jest.spyOn(mockUserRepository, 'find').mockResolvedValueOnce(usersArray);
    const users = await service.findAll();
    expect(mockUserRepository.find).toHaveBeenCalled();
    expect(users).toEqual(usersArray);
  });

  it('should remove an existing user', async () => {
    const userId = 1;
    jest.spyOn(mockUserRepository, 'delete').mockResolvedValueOnce(mockUser);

    const removedUser = await service.remove(userId);
    expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    expect(removedUser).toEqual(mockUser);
  });
});
