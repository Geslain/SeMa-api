import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

import configuration from '../config/configuration';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const config: ConfigService = new ConfigService(configuration());

export const dbConfig = {
  type: 'postgres' as const,
  host: config.get('database.host'),
  port: config.get('database.port'),
  username: config.get('database.username'),
  password: config.get('database.password'),
  database: config.get('database.name'),
  logging: config.get('env') !== 'test',
  entities: [__dirname + '/../../**/*.entity.{js,ts}'],
  migrationsTableName: 'typeorm_migrations',
  migrations: [__dirname + '/../migrations/*.{js,ts}'],
  migrationsRun: true,
};

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    try {
      await new DataSource(dbConfig).initialize(); // initialize the data source
      console.log('Database connected successfully');
      return dbConfig;
    } catch (error) {
      console.log('Error connecting to database');
      throw error;
    }
  },
};
export default new DataSource(dbConfig);
