import { createMockedUser } from './test';

describe('createMockedUser function', () => {
  it('should return user without id', () => {
    expect(createMockedUser(1)).toEqual({
      firstname: `foo1`,
      lastname: `bar1`,
      email: `foo.bar1@foobar.com`,
      password: `foobar1`,
    });
  });

  it('should return user without id', () => {
    expect(createMockedUser(1, true)).toEqual({
      firstname: `foo1`,
      lastname: `bar1`,
      email: `foo.bar1@foobar.com`,
      password: `foobar1`,
      id: 1,
    });
  });
});
