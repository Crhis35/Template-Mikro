import { Field, Int, ObjectType } from 'type-graphql';
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
import { Report } from './Message.entity';
import { MyPlan } from './Plan.entity';

@ObjectType()
@Entity()
export class Company extends Base {
  @Field()
  @Property()
  name!: string;

  @Field(() => Int)
  @Property({ columnType: 'int' })
  taxId!: number;

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
}

// @ObjectType()
// @Entity()
// export class Friendship extends Base {
//   @Field(() => Company)
//   @ManyToOne(() => Company)
//   user1!: Company;

//   @Field(() => Company)
//   @ManyToOne(() => Company)
//   user2!: Company;
// }
