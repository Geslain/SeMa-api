import { Test, TestingModule } from '@nestjs/testing';

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

      const signedInUser = await service.signIn(signInDto);

      expect(findUserSpy).toHaveBeenCalledWith(signInDto.email.toLowerCase());

      expect(signedInUser).toEqual(mockedUser);
    });

    it('should throw exception for created user', async () => {
      const { email } = usersDtoFactory.build();
      const signInDto: SignInDto = { email };
      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(null);

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
