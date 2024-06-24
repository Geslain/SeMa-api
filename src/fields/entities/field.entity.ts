import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../common/base-entity/base-entity.entity';

export enum FieldType {
  TEXT = 'text',
  DATE = 'date',
  LIST = 'list',
}

@Entity()
export class Field extends BaseEntity {
  @ApiProperty({
    example: 'Color',
    description: 'The name of the field',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    example: 'Text',
    description: 'The type of the',
    enum: FieldType,
  })
  @Column('enum', {
    enum: FieldType,
    default: FieldType.TEXT,
  })
  type: FieldType;

  @ApiProperty({
    example: ['Blue', 'Green', 'Red'],
    description: 'Value of field in case field type is "list"',
  })
  @Column('text', { array: true, nullable: true })
  values?: string[];

  @ApiProperty({
    description: "Field's owner",
  })
  @ManyToOne(
    /* istanbul ignore next */ () => User,
    /* istanbul ignore next */ (user) => user.fields,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  owner: User;
}
