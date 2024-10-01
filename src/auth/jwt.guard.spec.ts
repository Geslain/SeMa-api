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

  const mockReflector = {
    getAllAndOverride: jest.fn((_key): boolean => _key && false),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  const mockUserEmail = faker.internet.email();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        JwtGuard,
        {
          provide: JwtStrategy,
          useClass: class MockJWTStrategy extends PassportStrategy(Strategy) {
            constructor() {
              super({ secretOrKey: 'foo', jwtFromRequest: () => 'bar' });
            }
            authenticate() {
              this.success({ 'https://sema.com': mockUserEmail });
            }
          },
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
    jest.restoreAllMocks();
  });

  describe('canActivate()', () => {
    it('Should authorize when public', async () => {
      mockReflector.getAllAndOverride.mockReturnValueOnce(true);

      const returnValue = await jwtGuard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
      expect(returnValue).toEqual(true);
    });

    it('Should authorize user', async () => {
      const mockedUser = usersFactory.build();

      const findOneByEmailSpy = jest
        .spyOn(mockUsersService, 'findOneByEmail')
        .mockImplementation(() => Promise.resolve(mockedUser));

      const returnValue = await jwtGuard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      expect(findOneByEmailSpy).toHaveBeenCalledWith(mockUserEmail);
      expect(returnValue).toEqual(true);
    });

    it('Should not authorize user', async () => {
      const findOneByEmailSpy = jest
        .spyOn(mockUsersService, 'findOneByEmail')
        .mockImplementation(() => Promise.resolve(null));

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
        .mockImplementation(() => Promise.resolve(mockedUser));

      await expect(
        jwtGuard.canActivate(mockExecutionContext as ExecutionContext),
      ).rejects.toThrow(InvalidUserException);
      expect(findOneByEmailSpy).toHaveBeenCalledWith(mockUserEmail);
    });

    it('Should allow user to update info', async () => {
      const mockedUser = usersFactory.build({ firstname: '' });

      // Mock that user is on PATCH /users/:id route
      mockReflector.getAllAndOverride.mockImplementation(
        (key) => key === IS_USER_UPDATE_KEY,
      );

      const findOneByEmailSpy = jest
        .spyOn(mockUsersService, 'findOneByEmail')
        .mockImplementation(() => Promise.resolve(mockedUser));

      const returnValue = await jwtGuard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      expect(returnValue).toEqual(true);
      expect(findOneByEmailSpy).toHaveBeenCalledWith(mockUserEmail);
    });
  });
});
