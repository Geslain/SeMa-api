import { Test, TestingModule } from '@nestjs/testing';
import { REQUEST } from '@nestjs/core';

import { UsersService } from '../users/users.service';
import { usersFactory } from '../users/factories/users.factory';

import { WithOwnerService } from './with-owner.service';
import { MissingUserError } from './errors';

class TestWithOwnerService extends WithOwnerService {
  public async testGetOwner() {
    return this.getOwner();
  }
}

describe('WithOwnerService', () => {
  let withOwnerService: TestWithOwnerService;
  let usersService: Partial<jest.Mocked<UsersService>>;
  let mockRequest;

  beforeEach(async () => {
    mockRequest = {};
    usersService = {
      findOneByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: WithOwnerService, useClass: TestWithOwnerService },
        { provide: UsersService, useValue: usersService },
        { provide: REQUEST, useValue: mockRequest },
      ],
    }).compile();

    withOwnerService = module.get<TestWithOwnerService>(WithOwnerService);
  });

  it('should return the owner when user is found', async () => {
    const mockUser = usersFactory.build();
    mockRequest.user = { username: 'test@example.com' };
    usersService.findOneByEmail!.mockResolvedValue(mockUser);

    const owner = await withOwnerService.testGetOwner();
    expect(owner).toEqual(mockUser);
    expect(usersService.findOneByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });

  it('should throw MissingUserError when user is not found', async () => {
    mockRequest.user = { username: 'unknown@example.com' };
    usersService.findOneByEmail!.mockResolvedValue(null);

    await expect(withOwnerService.testGetOwner()).rejects.toThrow(
      MissingUserError,
    );
    expect(usersService.findOneByEmail).toHaveBeenCalledWith(
      'unknown@example.com',
    );
  });

  it('should throw MissingUserError when request has no user', async () => {
    await expect(withOwnerService.testGetOwner()).rejects.toThrow(
      MissingUserError,
    );
    expect(usersService.findOneByEmail).not.toHaveBeenCalled();
  });
});
