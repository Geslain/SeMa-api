import { User } from './user.entity';

describe('User entity', () => {
  describe('hashPassword', () => {
    it('should update password', async () => {
      const user = new User();
      const password = 'password';
      user.password = password + '';

      await user.hashPassword();

      expect(password).not.toEqual(user.password);
    });
  });

  describe('comparePassword', () => {
    it('should compare password', async () => {
      const user = new User();
      const password = 'password';
      const wrongPassword = 'wrong_password';
      user.password = password + '';

      await user.hashPassword();
      expect(await user.comparePassword(wrongPassword)).toBe(false);
      expect(await user.comparePassword(password)).toBe(true);
    });
  });
});
