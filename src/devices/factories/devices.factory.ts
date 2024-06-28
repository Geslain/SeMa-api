import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

import { CreateDeviceDto } from '../dto/create-device.dto';
import { baseEntityFactory } from '../../common/base-entity/base-entity.factory';
import { Device } from '../entities/device.entity';

export const devicesDtoFactory = Factory.define<CreateDeviceDto>(() => ({
  name: faker.word.noun(),
  deviceId: faker.string.sample(10),
  accessToken: faker.string.sample(15),
}));

export const devicesFactory = Factory.define<Device>(({ associations }) => ({
  ...baseEntityFactory.build(),
  ...devicesDtoFactory.build(),
  owner: associations.owner,
}));
