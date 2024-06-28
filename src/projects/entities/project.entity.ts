import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../../common/base-entity/base-entity.entity';
import { User } from '../../users/entities/user.entity';
import { DataRow } from '../data-row/entities/data-row.entity';
import { Field } from '../../fields/entities/field.entity';

@Entity()
export class Project extends BaseEntity {
  @ApiProperty({ example: 'My project', description: "Project's name" })
  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(
    /* istanbul ignore next */ () => DataRow,
    /* istanbul ignore next */ (dataRow) => dataRow.project,
  )
  dataRows: DataRow[];

  @ManyToMany(/* istanbul ignore next */ () => Field)
  @JoinTable()
  fields: Field[];

  @ManyToOne(
    /* istanbul ignore next */ () => User,
    /* istanbul ignore next */ (user) => user.projects,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  owner: User;
}
