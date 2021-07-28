import { Arg, Field, ObjectType } from 'type-graphql';
import {
  Entity,
  Property,
  OneToOne,
  OneToMany,
  Collection,
  ManyToOne,
  ManyToMany,
} from '@mikro-orm/core';
import { Base } from './BaseEntity';
import { AuthProvider } from './AuthProvider.entity';
import {
  Conversation,
  DeletedMessage,
  Message,
  Participant,
  Report,
} from './Message.entity';
import { ApiArgs } from '../resolver/input';
import { MyPlan } from './Plan.entity';

@ObjectType()
@Entity()
export class Company extends Base {
  @Field()
  @Property()
  name!: string;

  @Field()
  @Property()
  lastName!: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  picture?: string;

  @Field(() => [AuthProvider])
  @ManyToMany({ entity: () => AuthProvider, inversedBy: 'companies' })
  auths = new Collection<AuthProvider>(this);

  @Field(() => MyPlan, { nullable: true })
  @OneToOne(() => MyPlan, (myPlan) => myPlan.user, {
    owner: true,
    orphanRemoval: true,
    nullable: true,
  })
  myPlan?: MyPlan;

  @Field(() => [Message], { nullable: true })
  @OneToMany({
    entity: () => Message,
    mappedBy: 'to',
    orphanRemoval: true,
  })
  sendedMessages = new Collection<Message>(this);

  @Field(() => [Message], { nullable: true })
  @OneToMany({
    entity: () => Message,
    mappedBy: 'from',
    orphanRemoval: true,
  })
  receivedMessages = new Collection<Message>(this);

  @Field(() => [DeletedMessage], { nullable: true })
  @OneToMany({
    entity: () => DeletedMessage,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  deletedMessages = new Collection<Message>(this);

  @Field(() => [Conversation], { nullable: true })
  @OneToMany({
    entity: () => Conversation,
    mappedBy: 'creator',
    orphanRemoval: true,
  })
  conversations = new Collection<Message>(this);

  @Field(() => [Participant], { nullable: true })
  @OneToMany({
    entity: () => Participant,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  participants = new Collection<Message>(this);

  @Field(() => [Report], { nullable: true })
  @OneToMany({
    entity: () => Report,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  reports = new Collection<Report>(this);

  @Field(() => [Company])
  @ManyToMany({ entity: () => Company })
  companies = new Collection<Company>(this);
}

@ObjectType()
@Entity()
export class Friendship extends Base {
  @Field(() => Company)
  @ManyToOne(() => Company)
  user1!: Company;

  @Field(() => Company)
  @ManyToOne(() => Company)
  user2!: Company;
}
