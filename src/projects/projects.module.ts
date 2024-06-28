import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { FieldsModule } from '../fields/fields.module';
import { DevicesModule } from '../devices/devices.module';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    UsersModule,
    FieldsModule,
    DevicesModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
