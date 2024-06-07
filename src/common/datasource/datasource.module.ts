import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { connectionSource } from './datasource.constants';

@Global() // makes the module available globally for other modules once imported in the app modules
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource, // add the datasource as a provider
      inject: [],
      useFactory: async () => {
        // using the factory function to create the datasource instance
        try {
          await connectionSource.initialize(); // initialize the data source
          console.log('Database connected successfully');
          return connectionSource;
        } catch (error) {
          console.log('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule {}
