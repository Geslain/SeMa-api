import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';

import { Field } from '../../fields/entities/field.entity';
import { BaseEntity } from '../../common/base-entity/base-entity.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class User extends BaseEntity {
  @ApiProperty({ example: 'Lullaby', description: "User's firstname" })
  @Column({ type: 'varchar', nullable: true })
  firstname: string;

  @ApiProperty({ example: 'Norton', description: "User's lastname" })
  @Column({ type: 'varchar', nullable: true })
  lastname: string;

  @ApiProperty({
    example: 'lullaby.norton@gmail.com',
    description: "User's email",
  })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @ApiProperty({
    description: 'User created fields',
    type: Field,
    isArray: true,
  })
  @OneToMany(
    /* istanbul ignore next */ () => Field /* istanbul ignore next */,
    /* istanbul ignore next */ (field) => field.owner,
  )
  fields: Field[];
  @OneToMany(
    /* istanbul ignore next */ () => Project,
    /* istanbul ignore next */ (project) => project.owner,
    {},
  )
  projects: Project[];

  isValid() {
    return !!(this.email && this.firstname && this.lastname);
  }
}
