import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from './datasource/datasource.module';
import { FieldsModule } from './fields/fields.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [TypeOrmModule, UsersModule, ProjectsModule, FieldsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
