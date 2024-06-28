import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../common/base-entity/base-entity.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Device extends BaseEntity {
  @ApiProperty({
    example: 'My device',
    description: "Device's name",
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    example: 'ujIiD57gtyDsjOObu4tio1',
    description: 'Device id for connection',
  })
  @Column({ type: 'varchar' })
  deviceId: string;

  @ApiProperty({
    example: 'o.0xUybBNTbArEuartUubyqVtTYDM8jhnM',
    description: 'Access token for mobile',
  })
  @Column({ type: 'varchar' })
  accessToken: string;

  @ManyToOne(/* istanbul ignore next */ () => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  owner: User;
}
