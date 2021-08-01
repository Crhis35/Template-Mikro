import { Entity, Property, ManyToOne } from '@mikro-orm/core';
import { Field, Float, InputType, Int, ObjectType } from 'type-graphql';
import { Base } from './BaseEntity';
import { Company } from './Company.entity';

@ObjectType()
@InputType('PriceInput')
export class Price {
  @Field()
  name!: string;

  @Field()
  price!: number;
}

@ObjectType()
@Entity()
export class Product extends Base {
  @Field()
  @Property({ nullable: false })
  name!: string;

  @Field()
  @Property({ nullable: false })
  description!: string;

  @Field(() => [Price])
  @Property({ type: Price, nullable: true })
  listPrice!: Price[];

  @Field(() => Int)
  @Property({ columnType: 'int', nullable: false })
  defaultPrice!: number;

  @Field(() => Float)
  @Property({ columnType: 'decimal(10,2)', nullable: false })
  price!: number;

  @Field(() => Int)
  @Property({ columnType: 'int', nullable: false })
  ratingsQuantity!: number;

  @Field(() => Float)
  @Property({ columnType: 'decimal(10,2)', nullable: false })
  ratingsAverage!: number;

  @Field(() => String, { nullable: true })
  images?: [string] = [''];

  @Field(() => Int, { nullable: true })
  @Property({ columnType: 'int', nullable: true })
  quantity?: number;

  @Field(() => Boolean)
  @Property({ nullable: false })
  stock!: boolean;

  @Field(() => String, { nullable: true })
  @Property({ nullable: false })
  brand?: string;

  @Field(() => Company)
  @ManyToOne(() => Company)
  company!: Company;

  // Reviews: [Review];
}

// type Price {
//   name: String!
//   price: Float!
// }

// input PriceInput {
//   name: String!
//   price: Float!
// }

// type Product {
//   id: ID!
//   name: String!
//   description: String!
//   listPrice: [Price!]!
//   defaultPrice: Int!
//   price: Float!
//   ratingsQuantity: Int!
//   ratingsAverage: Float!
//   images: [String]
//   quantity: Int!
//   stock: Boolean!
//   brand: String
//   Reviews: [Review]
//   createdAt: Date
//   updateAt: Date
// }

// type ProductPaginator {
//   items: [Product]!
//   currentPage: Int!
//   totalPages: Int!
// }

// extend type Query {
//   getProduct(id: ID!): Product
//   listProducts(
//     search: String
//     page: Int
//     limit: Int
//     sort: SortBy
//     filter: String
//   ): ProductPaginator
// }

// input ProductInput {
//   name: String!
//   description: String!
//   listPrice: [PriceInput!]!
//   price: Float!
//   defaultPrice: Int!
//   images: [String]
//   quantity: Int!
//   stock: Boolean
//   brand: String
// }

// extend type Mutation {
//   createProduct(input: ProductInput!): Product
//     @auth
//     @hasRole(roles: [Admin, Moderator])
//   updateProduct(id: ID!, input: ProductInput!): Product
//     @auth
//     @hasRole(roles: [Admin, Moderator])
// }
const parse = {
  os: {
    name: 'Mac',
    short_name: 'MAC',
    version: '10.15.7',
    platform: '',
    family: 'Mac',
  },
  client: {
    type: 'browser',
    name: 'Chrome',
    short_name: 'CH',
    version: '91.0.4472.164',
    engine: 'Blink',
    engine_version: '',
    family: 'Chrome',
  },
  device: { id: 'AP', type: 'desktop', brand: 'Apple', model: '' },
};
