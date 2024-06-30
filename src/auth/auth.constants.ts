import { ConfigService } from '@nestjs/config';

import configuration from '../common/config/configuration';

const config = new ConfigService(configuration());

export const jwtConstants = {
  secret: config.get('JWT_SECRET'),
};
