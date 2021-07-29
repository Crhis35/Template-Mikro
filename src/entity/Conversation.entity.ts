import {
  Entity,
  Property,
  OneToMany,
  Collection,
  ManyToMany,
} from '@mikro-orm/core';
import { ObjectType, Field } from 'type-graphql';
import { AuthProvider } from './AuthProvider.entity';
import { Base } from './BaseEntity';
import { Message, Participant } from './Message.entity';

@ObjectType()
@Entity()
export class Conversation extends Base {
  @Field()
  @Property()
  title!: string;

  @Field(() => [Message], { nullable: true })
  @OneToMany({
    entity: () => Message,
    mappedBy: 'conversation',
    orphanRemoval: true,
  })
  messages = new Collection<Message>(this);

  @Field(() => [AuthProvider], { nullable: true })
  @ManyToMany({ entity: () => AuthProvider })
  users = new Collection<AuthProvider>(this);

  @Field(() => [Participant], { nullable: true })
  @OneToMany({
    entity: () => Participant,
    mappedBy: 'conversation',
    orphanRemoval: true,
  })
  participant = new Collection<Participant>(this);

  @Field({ nullable: true })
  @Property({ nullable: true })
  deleteAt?: Date;
}
