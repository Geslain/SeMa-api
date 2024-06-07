import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { Field } from './entities/field.entity';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';

@Module({
  imports: [TypeOrmModule.forFeature([Field]), UsersModule],
  controllers: [FieldsController],
  providers: [FieldsService],
  exports: [FieldsService],
})
export class FieldsModule {}
