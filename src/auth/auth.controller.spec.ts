import { Test, TestingModule } from '@nestjs/testing';

import { userDtoFactory, userFactory } from '../users/factories/user.factory';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
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

  describe('sign up', () => {
    it('should sign up', async () => {
      const signupDto: SignUpDto = userDtoFactory.build();
      const mockedUser = userFactory.build();
      const signUpSpy = jest
        .spyOn(service, 'signUp')
        .mockResolvedValueOnce(mockedUser);
      const signedUpUser = await controller.signUp(signupDto);

      expect(signUpSpy).toHaveBeenCalledWith(signupDto);
      expect(signedUpUser).toEqual(mockedUser);
    });
  });

  describe('sign in', () => {
    it('should sign in', async () => {
      const { email, password } = userDtoFactory.build();
      const signInDto: SignInDto = { email, password };
      const mockedUser = userFactory.build();
      const signInSpy = jest
        .spyOn(service, 'signIn')
        .mockResolvedValueOnce(mockedUser);
      const signedUpUser = await controller.signIn(signInDto);

      expect(signInSpy).toHaveBeenCalledWith(signInDto);
      expect(signedUpUser).toEqual(mockedUser);
    });
  });

  // TODO implement tests
});
