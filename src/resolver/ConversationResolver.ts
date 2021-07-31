import {
  Resolver,
  Arg,
  Ctx,
  ObjectType,
  Query,
  Directive,
  Info,
  Mutation,
  Field,
  InputType,
  ID,
} from 'type-graphql';

import { MyContext } from '../utils/interfaces/context.interface';

import { ApiArgs, PaginatedResponse } from './input';
import { APIFeatures } from './utils';
import { infoMapper } from '../utils/functions';
import { GraphQLResolveInfo } from 'graphql';
import { Conversation } from '../entity/Conversation.entity';

@ObjectType()
class PaginatedConversation extends PaginatedResponse(Conversation) {}

@InputType()
class InputMessage {
  @Field(() => ID)
  to!: string;
  @Field({ nullable: true })
  offset: number = 0;
  @Field({ nullable: true })
  limit: number = 10;
  @Field({ nullable: true })
  @Field({ nullable: true })
  filter?: String;
}

@Resolver(Conversation)
export class MessageResolver {
  @Query(() => PaginatedConversation, { nullable: true })
  @Directive('@auth')
  async listAllMessages(
    @Arg('args', {
      nullable: true,
      defaultValue: {
        search: '',
        offset: 0,
        limit: 10,
        sort: null,
        filter: '',
      },
    })
    args: ApiArgs,
    @Ctx() { em, currentUser }: MyContext,
    @Info() info: GraphQLResolveInfo
  ) {
    const newRelations = infoMapper(info, 'items');
    const id = currentUser ? currentUser.id : null;
    return await APIFeatures({
      Model: Conversation,
      em,
      args,
      id,
      fields: newRelations,
    });
  }

  @Mutation(() => Conversation)
  @Directive('@auth')
  async createConversation(
    @Arg('args')
    args: ApiArgs,
    @Ctx() { em, currentUser }: MyContext,
    @Info() info: GraphQLResolveInfo
  ) {}
}
