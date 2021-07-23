import { IsDate, IsEmail } from 'class-validator';
import { Arg, Field, Int, ObjectType } from 'type-graphql';
import { registerEnumType } from 'type-graphql';
import bycript from 'bcrypt';

import {
  Entity,
  Property,
  Enum,
  BeforeCreate,
  OneToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Base } from './BaseEntity';
import { User } from './User.entity';
import { ApiArgs } from '../resolver/input';
import { Device } from './Device.entity';

export enum Role {
  ADMIN = 'Admin',
  OWNER = 'Owner',
  USER = 'User',
}
export enum Provider {
  EMAIL = 'Email',
  GMAIL = 'Gmail',
}

export enum PhoneBrands {
  APPLE = 'APPLE',
  XIAOMI = 'XIAOMI',
  SAMSUNG = 'SAMSUNG',
  NOKIA = 'NOKIA',
  HUAWEI = 'HUAWEI',
  BLACKBERRY = 'BLACKBERRY',
}

registerEnumType(Role, {
  name: 'Role', // this one is mandatory,
  description: 'Roles of the user',
});

registerEnumType(Provider, {
  name: 'Provider', // this one is mandatory
  description: 'Gmail auth or email',
});

registerEnumType(PhoneBrands, {
  name: 'PhoneBrands', // this one is mandatory
  description: 'Phone Brands',
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

  @Field({ nullable: true })
  @OneToOne(() => User, (user) => user.auth, {
    owner: true,
    orphanRemoval: true,
    nullable: true,
  })
  user?: User;

  @Field(() => [Role])
  @Enum({ items: () => Role, array: true, default: [Role.USER] })
  role: Role[] = [Role.USER];

  @Field()
  @Property({ nullable: true })
  @IsDate()
  passwordChangedAt?: Date;

  @Field()
  @Property({ nullable: false, default: false })
  isReported: Boolean = false;

  @Field()
  @Property({ nullable: false, default: false })
  isBlocked: Boolean = false;

  @Field(() => [Device], { nullable: true })
  @OneToMany({
    entity: () => Device,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  devices(@Arg('args') args: ApiArgs) {
    return new Collection<Device>(this);
  }

  @Field()
  @Property({ nullable: true })
  @IsDate()
  passwordResetExpires?: Date;

  @BeforeCreate()
  async generateUuid() {
    this.owner = this.id;
    this.password = await bycript.hash(this.password, 12);
    this.verifiedCode = ~~(Math.random() * (99999 - 10000) + 10000);
  }

  async correctPassword(candidatePassword: string) {
    return await bycript.compare(candidatePassword, this.password || '');
  }
}

@ObjectType()
@Entity()
export class Access extends Base {
  @Field(() => PhoneBrands)
  @Enum({ items: () => PhoneBrands })
  brand!: PhoneBrands;

  @Field({ nullable: true })
  @OneToOne(() => Device, (device) => device.access)
  device!: Device;
}
