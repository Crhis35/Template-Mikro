import {
  ArgsType,
  ClassType,
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from 'type-graphql';
import { Provider, Role } from '../../entity/AuthProvider.entity';
import { Base } from '../../entity/BaseEntity';

@InputType()
export class AuthInput {
  @Field()
  userName!: string;
  @Field()
  email!: string;
  @Field({ nullable: true })
  password?: string;
  @Field(() => Provider, { nullable: true })
  provider?: Provider;
  @Field(() => [Role], { nullable: true })
  role?: [Role];
}
@InputType()
export class AuthInputLogin {
  @Field()
  email!: string;
  @Field()
  password!: string;
}

enum Order {
  Asc = 'ASC',
  Desc = 'DESC',
}
registerEnumType(Order, {
  name: 'Order',
});

@InputType()
class SortBy {
  @Field()
  field!: String;
  @Field(() => Order)
  order!: Order;
}
export function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
  @ObjectType(`Paginated${TItemClass.name}Response`)
  abstract class PaginatedResponseClass {
    @Field(() => [TItemClass])
    items!: TItem[];

    @Field(() => Int)
    totalPages!: number;

    @Field(() => Int)
    offset!: number;
  }
  return PaginatedResponseClass;
}

@InputType()
export class ApiArgs {
  @Field({ nullable: true })
  search: String = '';
  @Field({ nullable: true })
  offset: number = 0;
  @Field({ nullable: true })
  limit: number = 10;
  @Field({ nullable: true })
  sort?: SortBy;
  @Field({ nullable: true })
  filter?: String;
}
