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
import { ConversationRole, Participant } from '../entity/Message.entity';
import { AuthProvider } from '../entity/AuthProvider.entity';
import fieldsToRelations from 'graphql-fields-to-relations';
import { AppError } from '../utils/services/AppError';

@ObjectType()
class PaginatedConversation extends PaginatedResponse(Conversation) {}

@InputType()
class InputConversation {
  @Field({ nullable: true })
  title?: string;

  @Field(() => [ID])
  participants!: string[];
}

@Resolver(Conversation)
export class ConversationResolver {
  @Query(() => PaginatedConversation, { nullable: true })
  @Directive('@auth')
  async listAllConversations(
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
    { participants, title }: InputConversation,
    @Ctx() { em, currentUser }: MyContext,
    @Info() info: GraphQLResolveInfo
  ) {
    try {
      const fields = fieldsToRelations(info);
      if (!currentUser || !currentUser.verified)
        throw new AppError('User not allowed to create conversation', '401');

      const conversation = await em.getRepository(Conversation).create({
        title,
        owner: currentUser.id,
      });

      for (let p of participants) {
        const auth = await em
          .getRepository(AuthProvider)
          .findOneOrFail({ id: p });

        if (auth.id !== currentUser.id) {
          const curPar = await em.getRepository(Participant).create({
            conversation: conversation.id,
            user: p,
            owner: p,
          });

          conversation.participant.add(curPar);
          conversation.users.add(auth);
        }
      }

      const owner = await em.getRepository(Participant).create({
        conversation: conversation.id,
        user: currentUser.id,
        type: ConversationRole.OWNER,
        owner: currentUser.id,
      });
      conversation.participant.add(owner);
      conversation.users.add(currentUser);
      await em.persist([owner, conversation]).flush();

      await em.populate(conversation, fields);
      return conversation;
    } catch (error) {
      throw new AppError(error.message, '404');
    }
  }
}
