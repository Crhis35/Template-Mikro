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
  Info,
  FieldResolver,
} from 'type-graphql';

import { v4 } from 'uuid';
import { AuthProvider } from '../entity/AuthProvider.entity';
import { MyContext } from '../utils/interfaces/context.interface';

import DeviceDetector from 'node-device-detector';
import fieldsToRelations from 'graphql-fields-to-relations';

import { AuthInput, AuthInputLogin } from './input';
import { createSendToken } from './utils';
import { AppError } from '../utils/services/AppError';
import { Device } from '../entity/Device.entity';
import { Access } from '../entity/Acces.entity';
import Email from '../utils/services/email';
import { GraphQLResolveInfo } from 'graphql';
import { createBaseResolver } from './BaseResolver';

@ObjectType()
class AuthAndToken {
  @Field()
  token!: string;
  @Field()
  auth!: AuthProvider;
}

const AuthProviderBaseResolver = createBaseResolver(
  'AuthProvider',
  AuthProvider
);

@Resolver(AuthProvider)
export class AuthProviderResolver extends AuthProviderBaseResolver {
  @Mutation(() => AuthAndToken)
  async signIn(
    @Arg('input') input: AuthInput,
    @Ctx() { res, req, em }: MyContext
  ) {
    try {
      const detector = new DeviceDetector();
      const userAgent = req.get('User-Agent') || '';
      const result = detector.detect(userAgent);
      const auth = await em.getRepository(AuthProvider).create(input);

      const device = await em.getRepository(Device).create({
        brand: result.device.brand,
        user: auth.id,
        owner: auth.id,
      });

      const access = await em.getRepository(Access).create({
        token: v4(),
        device: device.id,
        owner: auth.id,
      });
      device.assign({ access: access.id }, { em });

      const url = `${req.protocol}://${req.get('host')}`;

      await em.persist([auth, device, access]).flush();

      await new Email(auth, url).sendWelcome(auth.verifiedCode);

      return await createSendToken(auth, res);
    } catch ({ message }) {
      throw new AppError(message as string, '404');
    }
  }

  // @Query(() => PaginatedAuthProvider, { nullable: true })
  // @Directive('@hasRole(roles: [ADMIN])')
  // async getAllUser(
  //   @Root() auth: AuthProvider,
  //   @Arg('args', { nullable: true })
  //   args: ApiArgs,
  //   @Ctx() { em }: MyContext
  // ) {
  //   return await APIFeatures(AuthProvider, em, args);
  // }

  @Query(() => AuthProvider)
  @Directive('@auth')
  async me(@Ctx() { currentUser }: MyContext) {
    return currentUser;
  }

  @Query(() => AuthAndToken, { nullable: true })
  async login(
    @Arg('input')
    { email, password }: AuthInputLogin,
    @Ctx() { res, em }: MyContext,
    @Info() info: GraphQLResolveInfo
  ) {
    try {
      const relationPaths: string[] = fieldsToRelations(info).filter(
        (field) => field !== 'auth'
      );

      const newRelations = relationPaths.map((word) => {
        const newWord = word.split('.');
        newWord.shift();
        return newWord.join('.');
      });

      const auth = await em
        .getRepository(AuthProvider)
        .findOneOrFail({ email }, newRelations);
      if (!(await auth.correctPassword(password)))
        throw new AppError('Invalid password or email', '401');

      return await createSendToken(auth, res);
    } catch (error) {
      console.log(error);
      throw new AppError(error.message, '401');
    }
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
      throw new AppError(error.message, error.code);
    }
  }

  @FieldResolver()
  async password() {
    return null;
  }

  // @FieldResolver()
  // async devices(
  //   @Root() auth: AuthProvider,
  //   @Arg('args', () => ApiArgs, {
  //     nullable: true,
  //     defaultValue: {
  //       search: '',
  //       offset: 0,
  //       limit: 10,
  //       sort: null,
  //       filter: '',
  //     },
  //   })
  //   args: ApiArgs,
  //   @Ctx() { em, currentUser, req }: MyContext
  // ) {
  //   const { sort, limit, offset } = args;
  //   await auth.devices.init();
  //   let orderBy: any = {};

  //   if (sort)
  //     orderBy[sort.field as keyof string] = sort.order === 'ASC' ? 1 : -1;

  //   const props = cleanObject({
  //     limit,
  //     offset,
  //     orderBy,
  //   });
  //   await auth.devices.getItems();

  //   const devices = await auth.devices.matching({ ...props });

  //   // await em.populate(devices, ['access']);
  //   return devices;
  // }
}
