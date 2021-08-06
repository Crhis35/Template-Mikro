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
  Subscription,
  Root,
  Args,
  PubSub,
  Publisher,
} from 'type-graphql';

import { MyContext } from '../utils/interfaces/context.interface';

import { ApiArgs, PaginatedResponse } from './input';
import { APIFeatures, processUpload } from './utils';
import { Message } from '../entity/Message.entity';
import { infoMapper } from '../utils/functions';
import { GraphQLResolveInfo } from 'graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { AppError } from '../utils/services/AppError';
import fieldsToRelations from 'graphql-fields-to-relations';

@ObjectType()
class PaginatedMessage extends PaginatedResponse(Message) {}

@InputType()
class InputMessage {
  @Field(() => ID)
  conversation!: string;

  @Field({ nullable: true })
  text?: string;
}
@ObjectType()
class OnMessage {
  @Field(() => Message)
  message?: Message;
}

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

  @Mutation(() => Message)
  @Directive('@auth')
  async sendMessage(
    @Arg('input')
    { conversation, text }: InputMessage,
    @Arg('image', () => [GraphQLUpload], { nullable: true })
    attachments: [FileUpload],

    @Ctx() { em, currentUser }: MyContext,
    @Info() info: GraphQLResolveInfo,
    @PubSub('ONCREATEMESSAGE') publish: Publisher<Message>
  ) {
    try {
      if (!currentUser || !currentUser.verified)
        throw new AppError('No current Company', '404');

      let images = [];

      if (attachments) {
        for (let file of attachments) {
          const input = await processUpload(file);
          images.push(input);
        }
      }

      const newRelations = fieldsToRelations(info);

      const newMessage = await em.getRepository(Message).create({
        conversation,
        text,
        from: currentUser.id,
        owner: currentUser.id,
        images,
      });
      await em.persistAndFlush(newMessage);
      await em.populate(newMessage, newRelations);

      await publish(newMessage);
      return newMessage;
    } catch (error) {
      throw new AppError(error.message, '404');
    }
  }

  @Subscription({
    topics: ['ONCREATEMESSAGE', 'ONUPDATEMESSAGE', 'ONDELETEMESSAGE'],
  })
  onCreateMessage(
    @Root() message: Message,
    @Arg('conversation', () => ID) conversationID: string
  ): OnMessage {
    try {
      if (message.conversation.id === conversationID) {
        return { message };
      } else return {};
    } catch (error) {
      throw new AppError(error.message, '404');
    }
  }
}
