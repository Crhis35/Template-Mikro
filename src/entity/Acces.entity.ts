import { Entity, Property, OneToOne } from '@mikro-orm/core';
import { ObjectType, Field } from 'type-graphql';
import { Base } from './BaseEntity';
import { Device } from './Device.entity';

@ObjectType()
@Entity()
export class Access extends Base {
  @Field()
  @Property({ unique: true })
  token!: string;

  @Field(() => Device)
  @OneToOne(() => Device, (device) => device.access)
  device!: Device;

  @Field({ nullable: true })
  @Property({ nullable: true })
  deleteAt?: Date;
}
