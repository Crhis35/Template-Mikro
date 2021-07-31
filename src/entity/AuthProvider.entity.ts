import { IsDate, IsEmail } from 'class-validator';
import { Field, Int, ObjectType } from 'type-graphql';
import { registerEnumType } from 'type-graphql';
import bycript from 'bcrypt';

import {
  Entity,
  Property,
  Enum,
  BeforeCreate,
  OneToMany,
  Collection,
  ManyToMany,
} from '@mikro-orm/core';
import { Base } from './BaseEntity';
import { Company } from './Company.entity';
import { Device } from './Device.entity';
import { Message, Participant, Report } from './Message.entity';
import { Conversation } from './Conversation.entity';

export enum Role {
  ADMIN = 'Admin',
  OWNER = 'Owner',
  USER = 'User',
}
export enum Provider {
  EMAIL = 'Email',
  GMAIL = 'Gmail',
}

export enum DeviceBrands {
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

registerEnumType(DeviceBrands, {
  name: 'DeviceBrands', // this one is mandatory
  description: 'Device Brands',
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

  @Field({ nullable: true })
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

  @Field(() => [Company], { nullable: true })
  @ManyToMany({ entity: () => Company, mappedBy: 'auths' })
  companies = new Collection<Company>(this);

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
  devices = new Collection<Device>(this);

  @Field()
  @Property({ nullable: true })
  @IsDate()
  passwordResetExpires?: Date;

  @Field(() => [Message], { nullable: true })
  @OneToMany({
    entity: () => Message,
    mappedBy: 'from',
    orphanRemoval: true,
  })
  from = new Collection<Message>(this);

  @Field(() => [Participant], { nullable: true })
  @OneToMany({
    entity: () => Participant,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  participants = new Collection<Message>(this);

  @Field(() => [Conversation], { nullable: true })
  @ManyToMany({ entity: () => Conversation, mappedBy: 'users' })
  conversations = new Collection<Conversation>(this);

  @Field(() => [Report], { nullable: true })
  @OneToMany({
    entity: () => Report,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  reports = new Collection<Report>(this);

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
