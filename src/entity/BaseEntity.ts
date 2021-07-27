import { Field, ID, ObjectType } from 'type-graphql';

import {
  Entity,
  Property,
  BaseEntity,
  PrimaryKey,
  JsonType,
  ArrayType,
} from '@mikro-orm/core';
import { v4 } from 'uuid';

@ObjectType()
@Entity()
class Tag {
  @Field()
  subject!: string;

  @Field()
  value!: string;
}

@ObjectType()
@Entity({ abstract: true })
export class Base extends BaseEntity<Base, 'id'> {
  @Field(() => ID)
  @PrimaryKey()
  id: string = v4();

  @Field(() => ID)
  @Property()
  owner!: string;

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field()
  @Property()
  createdAt: Date = new Date();

  @Field(() => [Tag])
  @Property({ type: ArrayType, nullable: true })
  tags?: Tag[];
}
