import { Arg, Args, Field, ObjectType, registerEnumType } from 'type-graphql';

import {
  Entity,
  Property,
  ManyToOne,
  Enum,
  OneToMany,
  Collection,
  ArrayType,
} from '@mikro-orm/core';
import { Base } from './BaseEntity';
import { User } from './User.entity';
import { ApiArgs } from '../resolver/input';

export enum ConversationRole {
  OWNER = 'OWNER',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

registerEnumType(ConversationRole, {
  name: 'ConversationRole', // this one is mandatory
  description: 'Roles in a conversation',
});

@ObjectType()
@Entity()
export class Message extends Base {
  @ManyToOne(() => User)
  to!: User;

  @ManyToOne(() => User)
  from!: User;

  @OneToMany({
    entity: () => DeletedMessage,
    mappedBy: 'message',
    orphanRemoval: true,
  })
  deletedMessages(@Args() {}: ApiArgs) {
    return new Collection<Message>(this);
  }

  @Field(() => [String], { nullable: true })
  @Property({ type: ArrayType, nullable: false })
  attachment?: [string];

  @Field()
  @Property()
  text!: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  deleteAt?: Date;
}

@ObjectType()
@Entity()
export class DeletedMessage extends Base {
  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Message)
  message!: Message;

  @Field(() => [String], { nullable: true })
  @Property({ type: ArrayType, nullable: false })
  attachment?: [string];

  @Field()
  @Property()
  text!: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  deleteAt?: Date;
}

@ObjectType()
@Entity()
export class Conversation extends Base {
  @ManyToOne(() => User)
  creator!: User;

  @Field()
  @Property()
  title!: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  deleteAt?: Date;
}

@ObjectType()
@Entity()
export class Participant extends Base {
  @Field(() => Conversation)
  @ManyToOne(() => Conversation)
  conversation!: Conversation;

  @Field(() => User)
  @ManyToOne(() => User)
  user!: User;

  @Field(() => ConversationRole)
  @Enum({ items: () => ConversationRole, default: ConversationRole.MEMBER })
  type: ConversationRole = ConversationRole.MEMBER;

  @Field(() => [Report], { nullable: true })
  @OneToMany({
    entity: () => Report,
    mappedBy: 'participant',
    orphanRemoval: true,
  })
  reports(@Arg('args') args: ApiArgs) {
    return new Collection<Report>(this);
  }
}
@ObjectType()
@Entity()
export class Report extends Base {
  @Field(() => User)
  @ManyToOne(() => User)
  user!: User;

  @Field(() => Participant)
  @ManyToOne(() => Participant)
  participant!: Participant;

  @Field()
  @Property()
  text!: string;

  @Field()
  @Property()
  reportType!: string;
}
