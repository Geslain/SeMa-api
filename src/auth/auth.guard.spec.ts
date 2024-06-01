import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { AuthGuard } from './auth.guard';
import { jwtConstants } from './constants';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  const mockExecutionContext: Partial<
    Record<
      jest.FunctionPropertyNames<ExecutionContext>,
      jest.MockedFunction<any>
    >
  > = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ headers: { authorization: '' } }),
      getResponse: jest.fn(),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractTokenFromHeader()', () => {
    it('Should return token', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const returnValue = authGuard.extractTokenFromHeader({
        headers: { authorization: 'Bearer token' },
      });
      expect(returnValue).toEqual('token');
    });

    it('Should return undefined', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const returnValue = authGuard.extractTokenFromHeader({
        headers: { authorization: 'p' },
      });

      expect(returnValue).toEqual(undefined);
    });
  });

  describe('canActivate()', () => {
    it('Should authorize when public', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const returnValue = await authGuard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
      expect(returnValue).toEqual(true);
    });

    it('Should authorize user', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      const token = 'token';
      const extractTokenFromHeaderSpy = jest
        .spyOn(AuthGuard.prototype as any, 'extractTokenFromHeader')
        .mockReturnValue(token);

      const verifyAsyncSpy = jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockReturnValue(Promise.resolve(true));

      const returnValue = await authGuard.canActivate(
        mockExecutionContext as ExecutionContext,
      );
      expect(extractTokenFromHeaderSpy).toHaveBeenCalledWith(
        mockExecutionContext.switchToHttp().getRequest(),
      );
      expect(verifyAsyncSpy).toHaveBeenCalledWith(token, {
        secret: jwtConstants.secret,
      });
      expect(returnValue).toEqual(true);
    });

    it('Should throw error if token is missing', async () => {
      const extractTokenFromHeaderSpy = jest
        .spyOn(AuthGuard.prototype as any, 'extractTokenFromHeader')
        .mockReturnValue(null);

      await expect(
        async () =>
          await authGuard.canActivate(mockExecutionContext as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      expect(extractTokenFromHeaderSpy).toHaveBeenCalledWith(
        mockExecutionContext.switchToHttp().getRequest(),
      );
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('Should throw error if token is wrong', async () => {
      const token = 'token';
      const extractTokenFromHeaderSpy = jest
        .spyOn(AuthGuard.prototype as any, 'extractTokenFromHeader')
        .mockReturnValue(token);

      const verifyAsyncSpy = jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockReturnValue(Promise.reject(undefined));

      await expect(
        async () =>
          await authGuard.canActivate(mockExecutionContext as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      expect(extractTokenFromHeaderSpy).toHaveBeenCalledWith(
        mockExecutionContext.switchToHttp().getRequest(),
      );
      expect(verifyAsyncSpy).toHaveBeenCalledWith(token, {
        secret: jwtConstants.secret,
      });
    });
  });
});
