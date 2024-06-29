import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';

import { UsersModule } from '../users/users.module';
import { FieldsModule } from '../fields/fields.module';
import { DevicesModule } from '../devices/devices.module';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { MessageProcessor } from './message.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    UsersModule,
    FieldsModule,
    DevicesModule,
    HttpModule,
    BullModule.registerQueue({
      name: 'message',
    }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, MessageProcessor],
  exports: [ProjectsService],
})
export class ProjectsModule {}
