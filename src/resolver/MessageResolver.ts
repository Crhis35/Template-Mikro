import { Resolver, Arg, Ctx, ObjectType, Query, Directive } from 'type-graphql';

import { MyContext } from '../utils/interfaces/context.interface';

import { ApiArgs, PaginatedResponse } from './input';
import { APIFeatures } from './utils';
import { Message } from '../entity/Message.entity';

@ObjectType()
class PaginatedMessage extends PaginatedResponse(Message) {}

@Resolver(Message)
export class MessageResolver {
  @Query(() => PaginatedMessage, { nullable: true })
  @Directive('@auth')
  async listMessages(
    @Arg('args', { nullable: true })
    args: ApiArgs,
    @Ctx() { em, currentUser }: MyContext
  ) {
    const id = currentUser ? currentUser.id : null;
    return await APIFeatures(Message, em, args, id);
  }
}
