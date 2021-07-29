import { Field, ObjectType, registerEnumType } from 'type-graphql';

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
import { AuthProvider } from './AuthProvider.entity';
import { Conversation } from './Conversation.entity';

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
  @ManyToOne(() => AuthProvider)
  to!: AuthProvider;

  @ManyToOne(() => AuthProvider)
  from!: AuthProvider;

  @ManyToOne(() => Conversation)
  conversation!: Conversation;

  @OneToMany({
    entity: () => DeletedMessage,
    mappedBy: 'message',
    orphanRemoval: true,
  })
  deletedMessages = new Collection<DeletedMessage>(this);

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
  @ManyToOne(() => AuthProvider)
  user!: AuthProvider;

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
export class Participant extends Base {
  @Field(() => Conversation)
  @ManyToOne(() => Conversation)
  conversation!: Conversation;

  @Field(() => AuthProvider)
  @ManyToOne(() => AuthProvider)
  user!: AuthProvider;

  @Field(() => ConversationRole)
  @Enum({ items: () => ConversationRole, default: ConversationRole.MEMBER })
  type: ConversationRole = ConversationRole.MEMBER;

  @Field(() => [Report], { nullable: true })
  @OneToMany({
    entity: () => Report,
    mappedBy: 'participant',
    orphanRemoval: true,
  })
  reports = new Collection<Report>(this);
}
@ObjectType()
@Entity()
export class Report extends Base {
  @Field(() => AuthProvider)
  @ManyToOne(() => AuthProvider)
  user!: AuthProvider;

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
