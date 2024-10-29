import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

import { UsersService } from '../users/users.service';
import {
  usersDtoFactory,
  usersFactory,
} from '../users/factories/users.factory';
import { CreatedUserException, InvalidUserException } from '../common/errors';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthService', () => {
  let service: AuthService;
  const mockUserService = {
    initialize: jest.fn(),
    findOneByEmail: jest.fn(),
    getCurrent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn()', () => {
    it('should return signed in user', async () => {
      const { email } = usersDtoFactory.build();
      const mockedUser = usersFactory.build({ email });
      const signInDto: SignInDto = { email };
      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(mockedUser);

      const currentUserSpy = jest
        .spyOn(mockUserService, 'getCurrent')
        .mockResolvedValue(mockedUser);

      const signedInUser = await service.signIn(signInDto);

      expect(currentUserSpy).toHaveBeenCalled();
      expect(findUserSpy).toHaveBeenCalledWith(signInDto.email.toLowerCase());

      expect(signedInUser).toEqual(mockedUser);
    });

    it('should throw exception for email different from current user', async () => {
      const mockedUser = usersFactory.build();
      const signInDto: SignInDto = { email: faker.internet.email() };

      const currentUserSpy = jest
        .spyOn(mockUserService, 'getCurrent')
        .mockResolvedValue(mockedUser);

      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(null);

      const initializeUserSpy = jest.spyOn(mockUserService, 'initialize');

      await expect(() => service.signIn(signInDto)).rejects.toThrowError(
        new BadRequestException(),
      );
      expect(currentUserSpy).toHaveBeenCalled();
      expect(findUserSpy).toHaveBeenCalledWith(signInDto.email.toLowerCase());
      expect(initializeUserSpy).not.toHaveBeenCalledWith(signInDto);
    });

    it('should throw exception for created user', async () => {
      const { email } = usersDtoFactory.build();
      const signInDto: SignInDto = { email };
      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(null);
      jest.spyOn(mockUserService, 'getCurrent').mockResolvedValue(null);

      const initializeUserSpy = jest.spyOn(mockUserService, 'initialize');

      await expect(() => service.signIn(signInDto)).rejects.toThrowError(
        new CreatedUserException(),
      );
      expect(findUserSpy).toHaveBeenCalledWith(signInDto.email.toLowerCase());
      expect(initializeUserSpy).toHaveBeenCalledWith(signInDto);
    });

    it('should throw exception for invalid user', async () => {
      const { email } = usersDtoFactory.build();
      const mockedUser = usersFactory.build({ email, firstname: '' });
      const signInDto: SignInDto = { email };
      jest.spyOn(mockUserService, 'getCurrent').mockResolvedValue(null);
      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(mockedUser);

      await expect(() => service.signIn(signInDto)).rejects.toThrowError(
        new InvalidUserException(),
      );
      expect(findUserSpy).toHaveBeenCalledWith(signInDto.email.toLowerCase());
    });
  });
});
