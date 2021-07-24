import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  Directive,
  Int,
  FieldResolver,
  Root,
} from 'type-graphql';

import { AuthProvider } from '../entity/AuthProvider.entity';
import { MyContext } from '../utils/interfaces/context.interface';

import { ApiArgs, AuthInput, AuthInputLogin, PaginatedResponse } from './input';
import { APIFeatures, createSendToken } from './utils';
import { AppError } from '../utils/services/AppError';

@ObjectType()
class PaginatedAuthProvider extends PaginatedResponse(AuthProvider) {}

@ObjectType()
class AuthAndToken {
  @Field()
  token!: string;
  @Field()
  auth!: AuthProvider;
}

@Resolver(AuthProvider)
export class AuthProviderResolver {
  @Mutation(() => AuthAndToken)
  async signIn(
    @Arg('input') input: AuthInput,
    @Ctx() { res, req, em }: MyContext
  ) {
    try {
      const auth = await em.getRepository(AuthProvider).create(input);
      await em.persist(auth).flush();
      return await createSendToken(auth, res);
    } catch (error) {
      throw new AppError(error.message, '404');
    }
  }
  @Query(() => PaginatedAuthProvider, { nullable: true })
  @Directive('@hasRole(roles: [ADMIN])')
  async getAllUser(
    @Root() auth: AuthProvider,
    @Arg('args', { nullable: true })
    { search, sort, limit, offset }: ApiArgs,
    @Ctx() { em }: MyContext
  ) {
    let orderBy: any = {};

    if (sort)
      orderBy[sort.field as keyof string] = sort.order === 'ASC' ? 1 : -1;

    return await auth.devices.matching({});
  }

  @Query(() => AuthProvider)
  @Directive('@auth')
  async me(@Ctx() { currentUser }: MyContext) {
    return currentUser;
  }

  @Query(() => AuthAndToken)
  async login(
    @Arg('input')
    { email, password }: AuthInputLogin,
    @Ctx() { res, em }: MyContext
  ) {
    const auth = await em
      .getRepository(AuthProvider)
      .findOneOrFail({ email }, ['user']);
    if (!(await auth.correctPassword(password)))
      throw new AppError('Invalid password or email', '401');

    return await createSendToken(auth, res);
  }

  @Mutation(() => AuthProvider)
  @Directive('@auth')
  async verified(
    @Arg('code', () => Int)
    code: number,
    @Ctx() { em, currentUser }: MyContext
  ) {
    try {
      if (!currentUser) throw new AppError('Not user', '401');
      if (currentUser.verifiedCode !== code)
        throw new AppError('Invalid code provided', '401');
      if (currentUser.verified)
        throw new AppError("You're currently verifed", '404');

      currentUser.assign({ verified: true });
      await em.persistAndFlush(currentUser);

      return currentUser;
    } catch (error) {
      // throw new AppError(error.message, error.code);
    }
  }
  @FieldResolver()
  async devices(
    @Root() auth: AuthProvider,
    @Arg('args', { nullable: true }) args: ApiArgs,
    @Ctx() { em, currentUser, ...props }: MyContext
  ) {
    // return await auth.devices.matching(args);
    return [];
  }
}
