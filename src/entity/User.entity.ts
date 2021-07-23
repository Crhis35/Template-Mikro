import { Arg, Field, ObjectType } from 'type-graphql';
import {
  Entity,
  Property,
  OneToOne,
  OneToMany,
  Collection,
  ManyToOne,
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

  @Field(() => [Message], { nullable: true })
  @OneToMany({
    entity: () => Message,
    mappedBy: 'to',
    orphanRemoval: true,
  })
  sendedMessages(@Arg('args') args: ApiArgs) {
    return new Collection<Message>(this);
  }

  @Field(() => [Message], { nullable: true })
  @OneToMany({
    entity: () => Message,
    mappedBy: 'from',
    orphanRemoval: true,
  })
  receivedMessages(@Arg('args') args: ApiArgs) {
    return new Collection<Message>(this);
  }

  @Field(() => [DeletedMessage], { nullable: true })
  @OneToMany({
    entity: () => DeletedMessage,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  deletedMessages(@Arg('args') args: ApiArgs) {
    return new Collection<Message>(this);
  }

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
  participants(@Arg('args') args: ApiArgs) {
    return new Collection<Message>(this);
  }

  @Field(() => [Report], { nullable: true })
  @OneToMany({
    entity: () => Report,
    mappedBy: 'user',
    orphanRemoval: true,
  })
  reports(@Arg('args') args: ApiArgs) {
    return new Collection<Report>(this);
  }

  @Field(() => [Friendship], { nullable: true })
  @OneToMany({
    entity: () => Friendship,
    mappedBy: 'user1',
    orphanRemoval: true,
  })
  friends(@Arg('args') args: ApiArgs) {
    return new Collection<Friendship>(this);
  }
}
@ObjectType()
@Entity()
export class Friendship extends Base {
  @Field(() => User)
  @ManyToOne(() => User)
  user1!: User;

  @Field(() => User)
  @ManyToOne(() => User)
  user2!: User;
}
