import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FieldsModule } from './fields/fields.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { TypeOrmModule } from './common/datasource/datasource.module';
import { DataRowFieldModule } from './projects/data-row/data-row-field/data-row-field.module';
import { DataRowModule } from './projects/data-row/data-row.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [
    TypeOrmModule,
    UsersModule,
    ProjectsModule,
    FieldsModule,
    AuthModule,
    DataRowFieldModule,
    DataRowModule,
    DevicesModule,
    RouterModule.register([
      {
        path: 'projects',
        module: ProjectsModule,
        children: [
          {
            path: '/:projectId/data-rows',
            module: DataRowModule,
            children: [
              {
                path: '/:dataRowId/data-row-fields',
                module: DataRowFieldModule,
              },
            ],
          },
        ],
      },
    ]),
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
