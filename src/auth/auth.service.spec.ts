import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import {
  usersDtoFactory,
  usersFactory,
} from '../users/factories/users.factory';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthService', () => {
  let service: AuthService;
  const mockUserService = {
    create: jest.fn(),
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
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

  describe('signUp()', () => {
    it('should return signed up user', async () => {
      const mockedUser = usersDtoFactory.build();
      const signupDto: SignUpDto = usersDtoFactory.build();
      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(null);
      const creatUserSpy = jest
        .spyOn(mockUserService, 'create')
        .mockResolvedValue(mockedUser);

      const signedUpUser = await service.signUp(signupDto);

      expect(findUserSpy).toHaveBeenCalledWith(signupDto.email.toLowerCase());
      expect(creatUserSpy).toHaveBeenCalledWith(signupDto);
      expect(signedUpUser).toEqual(mockedUser);
    });

    it('should throw error is user already exists', async () => {
      const mockedUser = usersDtoFactory.build();
      const signupDto: SignUpDto = usersDtoFactory.build();
      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(mockedUser);

      await expect(async () => await service.signUp(signupDto)).rejects.toThrow(
        ConflictException,
      );
      expect(findUserSpy).toHaveBeenCalledWith(signupDto.email.toLowerCase());
      expect(mockUserService.create).not.toHaveBeenCalledWith(signupDto);
    });
  });

  describe('signIn()', () => {
    it('should return signed in user', async () => {
      const mockedUser = usersFactory.build();
      const userPassword = mockedUser.password + '';
      await mockedUser.hashPassword();

      const { email, password } = usersDtoFactory.build({
        password: userPassword,
      });
      const mockAccessToken = 'access_token';
      const signInDto: SignInDto = { email, password };
      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(mockedUser);
      const signAsyncSpy = jest
        .spyOn(mockJwtService, 'signAsync')
        .mockResolvedValue(mockAccessToken);

      const signedInUser = await service.signIn(signInDto);

      expect(findUserSpy).toHaveBeenCalledWith(signInDto.email.toLowerCase());
      expect(signAsyncSpy).toHaveBeenCalledWith({
        sub: mockedUser.id,
        username: mockedUser.email,
      });
      expect(signedInUser).toEqual({
        user: mockedUser,
        accessToken: mockAccessToken,
      });
    });

    it('should throw error if user does not exists', async () => {
      const mockedUser = usersFactory.build();

      const { email, password } = usersDtoFactory.build({
        password: mockedUser.password,
      });
      const signInDto: SignInDto = { email, password };
      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(null);
      const signAsyncSpy = jest
        .spyOn(mockJwtService, 'signAsync')
        .mockResolvedValue(null);

      await expect(async () => await service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(findUserSpy).toHaveBeenCalledWith(signInDto.email.toLowerCase());
      expect(signAsyncSpy).not.toHaveBeenCalled();
    });

    it('should throw error if password does not match', async () => {
      const mockedUser = usersFactory.build();

      const { email, password } = usersDtoFactory.build({
        password: mockedUser.password,
      });
      const signInDto: SignInDto = { email, password };
      const findUserSpy = jest
        .spyOn(mockUserService, 'findOneByEmail')
        .mockResolvedValue(mockedUser);
      const signAsyncSpy = jest
        .spyOn(mockJwtService, 'signAsync')
        .mockResolvedValue(null);

      await expect(async () => {
        await service.signIn(signInDto);
      }).rejects.toThrow(UnauthorizedException);
      expect(findUserSpy).toHaveBeenCalledWith(signInDto.email.toLowerCase());
      expect(signAsyncSpy).not.toHaveBeenCalled();
    });
  });
});
