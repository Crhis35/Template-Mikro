import { GraphQLResolveInfo } from 'graphql';
import fieldsToRelations from 'graphql-fields-to-relations';
import {
  ClassType,
  Query,
  Arg,
  Int,
  Resolver,
  Ctx,
  Root,
  Info,
  ObjectType,
} from 'type-graphql';
import { infoMapper } from '../utils/functions';
import { MyContext } from '../utils/interfaces/context.interface';
import { AppError } from '../utils/services/AppError';
import { ApiArgs, PaginatedResponse } from './input';
import { APIFeatures } from './utils';

export function createBaseResolver<T extends ClassType>(
  suffix: string,
  objectTypeCls: T
) {
  @ObjectType(`Paginated${objectTypeCls.name}Response`)
  class Paginated extends PaginatedResponse(objectTypeCls) {}

  @Resolver({ isAbstract: true })
  abstract class BaseResolver {
    @Query(() => Paginated, { name: `listAll${suffix}s`, nullable: true })
    async listAll(
      @Arg('args', () => ApiArgs, {
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
      @Ctx() { em }: MyContext,
      @Info() info: GraphQLResolveInfo
    ): Promise<Paginated> {
      try {
        const newRelations = infoMapper(info, 'items');
        const result = await APIFeatures({
          Model: objectTypeCls,
          em,
          args,
          fields: newRelations,
        });

        return result;
      } catch (error) {
        throw new AppError(error.message, '401');
      }
    }
    @Query(() => objectTypeCls, { name: `get${suffix}` })
    async get(
      @Arg('id') id: string,
      @Ctx() { em }: MyContext,
      @Info() info: GraphQLResolveInfo
    ) {
      try {
        const relationPaths: string[] = fieldsToRelations(info as any);

        return await await em
          .getRepository(objectTypeCls)
          .findOneOrFail({ id }, relationPaths);
      } catch (error) {
        throw new AppError(error.message, '401');
      }
    }
  }

  return BaseResolver;
}
