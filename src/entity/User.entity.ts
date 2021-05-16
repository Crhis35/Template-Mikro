import { IsDate, IsEmail } from 'class-validator';
import { Field, Int, ObjectType } from 'type-graphql';
import { registerEnumType } from 'type-graphql';
import bycript from 'bcrypt';

import {
  Entity,
  Property,
  Enum,
  BeforeCreate,
  OneToOne,
} from '@mikro-orm/core';
import { Base } from './BaseEntity';
import { AuthProvider } from './AuthProvider.entity';

export enum Role {
  ADMIN = 'Admin',
  OWNER = 'Owner',
  USER = 'User',
}
export enum Provider {
  EMAIL = 'Email',
  GMAIL = 'Gmail',
}

registerEnumType(Role, {
  name: 'Role', // this one is mandatory
});
registerEnumType(Provider, {
  name: 'Provider', // this one is mandatory
  description: 'Gmail auth or email',
});

@ObjectType()
@Entity()
export class User extends Base {
  @Field()
  @Property()
  name!: string;

  @Field()
  @Property()
  lastName!: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  picture?: string;

  @Field(() => AuthProvider)
  @OneToOne(() => AuthProvider, (auth) => auth.user)
  auth!: AuthProvider;
}
