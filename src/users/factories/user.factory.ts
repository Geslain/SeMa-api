import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { baseEntityFactory } from '../../common/base-entity/base-entity.factory';

export const userDtoFactory = Factory.define<CreateUserDto>(() => ({
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
  email: faker.internet.email(),
  password:
    faker.internet.password({
      length: 1,
      pattern: /[A-Z]/,
    }) +
    faker.internet.password({
      length: 1,
      pattern: /[a-z]/,
    }) +
    faker.internet.password({
      length: 1,
      pattern: /\d/,
    }) +
    faker.internet.password({
      length: 1,
      pattern: /[@$!%*?&]/,
    }) +
    faker.internet.password({
      length: 16,
      pattern: /[A-Za-z\d@$!%*?&]/,
    }),
}));

export const userFactory = Factory.define<User>(() => {
  return Object.assign(new User(), {
    ...baseEntityFactory.build(),
    ...userDtoFactory.build(),
    fields: [],
  });
});
