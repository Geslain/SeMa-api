import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from './datasource/datasource.module';
import { FieldsModule } from './fields/fields.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { DataRowFieldModule } from './data-row-field/data-row-field.module';

@Module({
  imports: [
    TypeOrmModule,
    UsersModule,
    ProjectsModule,
    FieldsModule,
    AuthModule,
    DataRowFieldModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthGuard,
    {
      provide: APP_GUARD,
      useExisting: AuthGuard,
    },
  ],
})
export class AppModule {}
