import { Module, Scope } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FieldsModule } from './fields/fields.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DataRowFieldModule } from './projects/data-row/data-row-field/data-row-field.module';
import { DataRowModule } from './projects/data-row/data-row.module';
import { DevicesModule } from './devices/devices.module';
import configuration from './common/config/configuration';
import { typeOrmAsyncConfig } from './common/datasource/datasource.constants';
import { JwtGuard } from './auth/jwt.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule,
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
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
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtGuard,
    {
      provide: APP_GUARD,
      scope: Scope.REQUEST,
      useExisting: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
