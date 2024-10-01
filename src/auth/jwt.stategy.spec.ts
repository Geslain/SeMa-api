import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { UnauthorizedException } from '@nestjs/common';

import { JwtStrategy } from './jwt.strategy';

jest.mock('jwks-rsa', () => ({
  ...jest.requireActual('jwks-rsa'),
  passportJwtSecret: jest.fn().mockReturnValue('mockSecret'),
}));

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'auth0.audience':
            return 'test-audience';
          case 'auth0.issuer_url':
            return 'https://test-issuer.com/';
          default:
            return null;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should configure the strategy with correct parameters', () => {
    expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
    expect(configService.get).toHaveBeenCalledWith('auth0.audience');
    expect(configService.get).toHaveBeenCalledWith('auth0.issuer_url');

    expect(passportJwtSecret).toHaveBeenCalledWith({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://test-issuer.com/.well-known/jwks.json',
    });
  });

  describe('validate()', () => {
    it('should return the payload if valid', () => {
      const payload = {
        sub: '1234567890',
        name: 'John Doe',
        email: 'test@example.com',
      };

      const result = jwtStrategy.validate(payload);

      expect(result).toEqual(payload);
    });

    it('should throw an UnauthorizedException if the payload is invalid', () => {
      const payload = null;

      try {
        jwtStrategy.validate(payload);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
