import { Test, TestingModule } from '@nestjs/testing';

import {
  usersDtoFactory,
  usersFactory,
} from '../users/factories/users.factory';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sign in', () => {
    it('should sign in', async () => {
      const { email } = usersDtoFactory.build();
      const signInDto: SignInDto = { email };
      const mockedUser = usersFactory.build();
      const signInSpy = jest
        .spyOn(service, 'signIn')
        .mockResolvedValueOnce(mockedUser);
      const signedUpUser = await controller.signIn(signInDto);

      expect(signInSpy).toHaveBeenCalledWith(signInDto);
      expect(signedUpUser).toEqual(mockedUser);
    });
  });
});
