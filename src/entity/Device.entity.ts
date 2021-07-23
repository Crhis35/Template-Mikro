import { Entity, Property, Enum, ManyToOne, OneToOne } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { PhoneBrands, AuthProvider, Access } from './AuthProvider.entity';
import { Base } from './BaseEntity';

@ObjectType()
@Entity()
export class Device extends Base {
  @Field()
  @Property({ unique: true })
  token!: string;

  @Field(() => PhoneBrands)
  @Enum({ items: () => PhoneBrands })
  brand!: PhoneBrands;

  @Field(() => AuthProvider)
  @ManyToOne(() => AuthProvider)
  user!: AuthProvider;

  @OneToOne(() => Access, (access) => access.device, {
    owner: true,
    orphanRemoval: true,
    nullable: true,
  })
  access?: Access;

  @Field({ nullable: true })
  @Property({ nullable: true })
  deleteAt?: Date;
}
