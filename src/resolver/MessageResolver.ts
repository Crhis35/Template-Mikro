import {
  Resolver,
  Arg,
  Ctx,
  ObjectType,
  Query,
  Directive,
  Info,
} from 'type-graphql';

import { MyContext } from '../utils/interfaces/context.interface';

import { ApiArgs, PaginatedResponse } from './input';
import { APIFeatures } from './utils';
import { Message } from '../entity/Message.entity';
import { infoMapper } from '../utils/functions';
import { GraphQLResolveInfo } from 'graphql';

@ObjectType()
class PaginatedMessage extends PaginatedResponse(Message) {}

@Resolver(Message)
export class MessageResolver {
  @Query(() => PaginatedMessage, { nullable: true })
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
      Model: Message,
      em,
      args,
      id,
      fields: newRelations,
    });
  }
}
