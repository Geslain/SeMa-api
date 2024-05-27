import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

export const userFactory = Factory.define<User>(() => ({
  id: faker.string.uuid(),
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
  email: faker.internet.email(),
  password: 'a123!eGsl',
  fields: [],
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
}));

export const userDtoFactory = Factory.define<CreateUserDto>(() => ({
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
  email: faker.internet.email(),
  password: 'a123!eGsl',
}));
