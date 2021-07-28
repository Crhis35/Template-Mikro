import {
  Entity,
  Property,
  ManyToOne,
  OneToOne,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { Base } from './BaseEntity';
import { Company } from './Company.entity';

@ObjectType()
@Entity()
export class Plan extends Base {
  @Field(() => [MyPlan], { nullable: true })
  @OneToMany({
    entity: () => MyPlan,
    mappedBy: 'type',
    orphanRemoval: true,
  })
  plans = new Collection<MyPlan>(this);

  @Field({ nullable: false })
  @Property({ nullable: false })
  description!: string;

  // features: [PlanFeature]
  // terms: [PlanTerm]
  @Field({ nullable: false })
  @Property({
    columnType: 'decimal(10, 2)',
    nullable: false,
  })
  price!: number;
}

@ObjectType()
@Entity()
export class MyPlan extends Base {
  @Field(() => Company)
  @OneToOne(() => Company, (company) => company.myPlan)
  user!: Company;

  @Field(() => Plan, { nullable: false })
  @ManyToOne(() => Plan)
  type!: Plan;

  @Field(() => Date)
  @Property({ nullable: false })
  initDate!: Date;

  @Field(() => Date)
  @Property({ nullable: false })
  endDate!: Date;

  @Field(() => Boolean)
  @Property({ nullable: false, default: false })
  active!: Boolean;
}
