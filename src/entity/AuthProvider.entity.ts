import { IsDate, IsEmail } from 'class-validator';
import { Field, Int, ObjectType } from 'type-graphql';
import { registerEnumType } from 'type-graphql';
import bycript from 'bcrypt';

import { Entity, Property, Enum, BeforeCreate } from '@mikro-orm/core';
import { Base } from './BaseEntity';

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
export class AuthProvider extends Base {
  @Field()
  @Property({ unique: true })
  userName!: string;

  @Field()
  @Property({ nullable: true, hidden: true })
  password?: string;

  @Field()
  @Property({ unique: true })
  @IsEmail()
  email!: string;

  @Field(() => Provider)
  @Enum({ items: () => Provider, default: Provider.EMAIL })
  provider: Provider = Provider.EMAIL;

  @Field(() => Int)
  @Property()
  verifiedCode!: Number;

  @Field()
  @Property({
    type: 'boolean',
    default: false,
  })
  verified!: Boolean;

  @Field()
  @Property({ nullable: true })
  userId?: string;

  @Field(() => [Role])
  @Enum({ items: () => Role, array: true, default: [Role.USER] })
  role: Role[] = [Role.USER];

  @Field()
  @Property({ nullable: true })
  @IsDate()
  passwordChangedAt?: Date;

  @Field()
  @Property({ nullable: true })
  @IsDate()
  passwordResetExpires?: Date;

  @BeforeCreate()
  async generateUuid() {
    this.password = await bycript.hash(this.password, 12);
    this.verifiedCode = ~~(Math.random() * (99999 - 10000) + 10000);
  }
}
