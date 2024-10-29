import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { faker } from '@faker-js/faker';

import { UsersService } from '../users/users.service';
import { usersFactory } from '../users/factories/users.factory';
import { InvalidUserException } from '../common/errors';

import { JwtGuard } from './jwt.guard';
import { JwtStrategy } from './jwt.strategy';
import { IS_USER_UPDATE_KEY } from './decorator/user-update.decorator';
import { IS_LOGIN_KEY } from './decorator/is-login.decorator';

describe('JwtGuard', () => {
  let jwtGuard: JwtGuard;
  const mockExecutionContext: Partial<
    Record<
      jest.FunctionPropertyNames<ExecutionContext>,
      jest.MockedFunction<any>
    >
  > = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest
        .fn()
        .mockReturnValue({ headers: { authorization: 'Bearer bar' } }),
      getResponse: jest.fn(),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  const mockUserEmail = faker.internet.email();

  const mockReflector = {
    getAllAndOverride: jest.fn((_key): boolean => _key && false),
  };
  const mockAuthenticate = jest.fn(function (t) {
    t.success({ 'https://sema.com': mockUserEmail });
  });

  const mockStrategy = class MockJWTStrategy extends PassportStrategy(
    Strategy,
  ) {
    constructor() {
      super({ secretOrKey: 'foo', jwtFromRequest: () => 'bar' });
    }
    authenticate() {
      return mockAuthenticate(this);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        JwtGuard,
        {
          provide: JwtStrategy,
          useClass: mockStrategy,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
      exports: [PassportModule],
    }).compile();

    jwtGuard = module.get<JwtGuard>(JwtGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate()', () => {
    describe('Login', () => {
      jest
        .spyOn(mockReflector, 'getAllAndOverride')
        .mockImplementationOnce((metadataKey) => metadataKey === IS_LOGIN_KEY);

      it('Should return true', async () => {
        const returnValue = await jwtGuard.canActivate(
          mockExecutionContext as ExecutionContext,
        );

        expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
          IS_LOGIN_KEY,
          [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
        );
        expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
          IS_USER_UPDATE_KEY,
          [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
        );
        expect(returnValue).toEqual(true);
        expect(mockUsersService.findOneByEmail).not.toHaveBeenCalled();
      });

      it('Should return false', async () => {
        mockAuthenticate.mockImplementationOnce((t) => {
          t.fail();
        });

        await expect(
          jwtGuard.canActivate(mockExecutionContext as ExecutionContext),
        ).rejects.toThrow(new Error('Unauthorized'));

        expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
          IS_LOGIN_KEY,
          [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
        );
        expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
          IS_USER_UPDATE_KEY,
          [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
        );
        expect(mockUsersService.findOneByEmail).not.toHaveBeenCalled();
      });
    });

    it('Should authorize user', async () => {
      const mockedUser = usersFactory.build();

      const findOneByEmailSpy = jest
        .spyOn(mockUsersService, 'findOneByEmail')
        .mockImplementationOnce(() => Promise.resolve(mockedUser));

      const returnValue = await jwtGuard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      expect(findOneByEmailSpy).toHaveBeenCalledWith(mockUserEmail);
      expect(returnValue).toEqual(true);
    });

    it('Should not authorize user', async () => {
      const findOneByEmailSpy = jest
        .spyOn(mockUsersService, 'findOneByEmail')
        .mockImplementationOnce(() => Promise.resolve(null));

      const returnValue = await jwtGuard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      expect(findOneByEmailSpy).toHaveBeenCalledWith(mockUserEmail);
      expect(returnValue).toEqual(false);
    });

    it('Should throw invalid user exception', async () => {
      const mockedUser = usersFactory.build({ firstname: '' });

      const findOneByEmailSpy = jest
        .spyOn(mockUsersService, 'findOneByEmail')
        .mockImplementationOnce(() => Promise.resolve(mockedUser));

      await expect(
        jwtGuard.canActivate(mockExecutionContext as ExecutionContext),
      ).rejects.toThrow(InvalidUserException);
      expect(findOneByEmailSpy).toHaveBeenCalledWith(mockUserEmail);
    });

    it('Should allow user to update info', async () => {
      const mockedUser = usersFactory.build();

      // Mock that user is on PATCH /users/:id route
      mockReflector.getAllAndOverride.mockImplementationOnce(
        (key) => key === IS_USER_UPDATE_KEY,
      );

      const findOneByEmailSpy = jest
        .spyOn(mockUsersService, 'findOneByEmail')
        .mockImplementationOnce(() => Promise.resolve(mockedUser));

      const returnValue = await jwtGuard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      expect(returnValue).toEqual(true);
      expect(findOneByEmailSpy).toHaveBeenCalledWith(mockUserEmail);
    });
  });
});
