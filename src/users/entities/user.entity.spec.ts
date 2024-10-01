import { faker } from '@faker-js/faker';

import { usersFactory } from '../factories/users.factory';

describe('User entity', () => {
  describe('isValid', () => {
    it('Should return true if all user info are filled', async () => {
      const user = usersFactory.build();

      const isValid = user.isValid();

      expect(isValid).toEqual(true);
    });

    it('Should return false if user is missing info ', async () => {
      const user = usersFactory.build();

      user.email = '';

      const isValid = user.isValid();

      expect(isValid).toEqual(false);

      user.email = faker.internet.email();
      user.firstname = '';

      expect(isValid).toEqual(false);

      user.firstname = faker.person.firstName();
      user.lastname = '';

      expect(isValid).toEqual(false);
    });
  });
});
