import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
  InputType,
  Info,
  Directive,
} from 'type-graphql';

import { AuthProvider, Provider, Role } from '../entity/AuthProvider.entity';
import { ApolloError } from 'apollo-server-express';
import { MyContext } from '../utils/interfaces/context.interface';
import { GraphQLResolveInfo } from 'graphql';
import fieldsToRelations from 'graphql-fields-to-relations';
import { environment } from '../environment';

import jwt from 'jsonwebtoken';
import Email from '../utils/services/email';

@ObjectType()
class AuthAndToken {
  @Field()
  token!: string;
  @Field()
  auth!: AuthProvider;
}
@InputType()
class AuthInput {
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

@Resolver(AuthProvider)
export class AuthProviderResolver {
  @Mutation(() => AuthAndToken)
  async signIn(
    @Arg('input') input: AuthInput,
    @Ctx() { res, req, em }: MyContext
  ) {
    try {
      const auth = em.getRepository(AuthProvider).create(input);
      await em.persist(auth).flush();

      const url = `${req.protocol}://${req.get('host')}`;

      await new Email(auth, url).sendWelcome(auth.verifiedCode);
      const token = jwt.sign({ id: auth.id }, environment.jwtSecret, {
        expiresIn: environment.jwtExpires,
      });

      const cookieOptions = {
        expires: new Date(
          Date.now() + environment.jwtCookieExpires * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: false,
      };
      if (environment.env === 'production') cookieOptions.secure = true;

      res.cookie('jwt', token, cookieOptions);

      return {
        token,
        auth,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
  @Query(() => [AuthProvider], { nullable: true })
  @Directive('@hasRole(roles: [ADMIN])')
  async getAllUser(@Ctx() { em }: MyContext, @Info() info: GraphQLResolveInfo) {
    // you are not logged in
    const relationPaths = fieldsToRelations(info);
    return em.getRepository(AuthProvider).findAll(relationPaths);
  }
}
