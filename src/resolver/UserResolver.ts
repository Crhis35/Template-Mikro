import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  Info,
  Directive,
  Int,
  InputType,
} from 'type-graphql';

import { AuthProvider } from '../entity/AuthProvider.entity';
import { MyContext } from '../utils/interfaces/context.interface';
import { GraphQLResolveInfo } from 'graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { ApiArgs, AuthInput, PaginatedResponse } from './input';
import { APIFeatures, createSendToken, processUpload } from './utils';
import { AppError } from '../utils/services/AppError';
import { User } from '../entity/User.entity';

@InputType()
class UserInput {
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  lastName?: string;
  @Field({ nullable: true })
  picture?: string;
}

@Resolver(User)
export class UserResolver {
  @Directive('@hasRole(roles: [USER])')
  @Mutation(() => AuthProvider)
  async createUser(
    @Arg('input') input: UserInput,
    @Ctx() { em, currentUser }: MyContext
  ) {
    try {
      if (!currentUser) throw new AppError('No credentiasl', '404');
      if (!currentUser.verified)
        throw new AppError('You are not currently verifed', '404');

      const user = await em.getRepository(User).create({
        ...input,
        auth: currentUser,
        owner: currentUser.id,
      });

      await em.persist(user).flush();
      return currentUser;
    } catch (error) {
      throw new AppError(error.message, '404');
    }
  }

  @Directive('@auth')
  @Mutation(() => AuthProvider)
  async updateUser(
    @Arg('input', { nullable: true }) input: UserInput,
    @Arg('image', () => GraphQLUpload, { nullable: true }) image: FileUpload,
    @Ctx() { em, currentUser }: MyContext
  ) {
    try {
      if (!currentUser || !currentUser.user)
        throw new AppError('No current User', '404');
      let picture;
      if (image) picture = await processUpload(image);

      currentUser.user.assign({ ...input, picture });
      await em.persist(currentUser).flush();
      return currentUser;
    } catch (error) {
      throw new AppError(error.message, '404');
    }
  }
}
