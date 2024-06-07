import 'dotenv/config';

import { DataSource } from 'typeorm';

export const connectionSource = new DataSource({
  type: 'postgres',
  host:
    process.env.NODE_ENV === 'test' ? 'localhost' : process.env.DATABASE_HOST,
  port: process.env.NODE_ENV === 'test' ? 55044 : +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  logging: process.env.NODE_ENV !== 'test',
  entities: [__dirname + '/../../**/*.entity.{js,ts}'],
  migrationsTableName: 'typeorm_migrations',
  migrations: [__dirname + '/../migrations/*.{js,ts}'],
  migrationsRun: true,
});
