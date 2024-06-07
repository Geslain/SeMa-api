import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty({
    example: 'd13f7357-a2f4-4043-a5b7-7c9617c66e8d',
    description: "Entity's unique id",
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '2024-05-30 17:08:03.503496',
    description: "Entity's create date",
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    example: '2024-05-30 17:08:03.503496',
    description: "Entity's update date",
  })
  @UpdateDateColumn()
  updated_at: Date;
}
