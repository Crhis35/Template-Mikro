import { Entity, Property, Enum, ManyToOne, OneToOne } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { Access } from './Acces.entity';
import { DeviceBrands, AuthProvider } from './AuthProvider.entity';
import { Base } from './BaseEntity';

@ObjectType()
@Entity()
export class Device extends Base {
  @Field(() => DeviceBrands)
  @Enum({ items: () => DeviceBrands })
  brand!: DeviceBrands;

  @Field(() => AuthProvider)
  @ManyToOne(() => AuthProvider)
  user!: AuthProvider;

  @Field(() => Access, { nullable: true })
  @OneToOne(() => Access, (access) => access.device, {
    owner: true,
    orphanRemoval: true,
    nullable: true,
  })
  access?: Access;
}
