import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty({
    example: faker.string.uuid(),
    description: "Entity's unique id",
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: faker.date.past(),
    description: "Entity's create date",
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    example: faker.date.recent(),
    description: "Entity's update date",
  })
  @UpdateDateColumn()
  updated_at: Date;
}
