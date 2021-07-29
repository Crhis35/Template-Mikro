import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  Directive,
  InputType,
  Info,
  Int,
} from 'type-graphql';

import { AuthProvider } from '../entity/AuthProvider.entity';
import { MyContext } from '../utils/interfaces/context.interface';

import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { processUpload } from './utils';
import { AppError } from '../utils/services/AppError';
import { Company } from '../entity/Company.entity';
import { createBaseResolver } from './BaseResolver';
import { GraphQLResolveInfo } from 'graphql';
import fieldsToRelations from 'graphql-fields-to-relations';
import { Tag } from '../entity/BaseEntity';

@InputType()
class UserInput {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  taxId?: number;

  @Field({ nullable: true })
  picture?: string;

  @Field(() => [Tag], { nullable: true })
  tags?: [Tag];
}

const CompanyBaseResolver = createBaseResolver('Company', Company);

@Resolver(Company)
export class CompanyResolver extends CompanyBaseResolver {
  @Directive('@hasRole(roles: [USER])')
  @Mutation(() => AuthProvider)
  async createCompany(
    @Arg('input') input: UserInput,
    @Ctx() { em, currentUser }: MyContext
  ) {
    try {
      if (!currentUser) throw new AppError('No credentials', '404');
      if (!currentUser.verified)
        throw new AppError('You are not currently verifed', '404');

      const user = await em.getRepository(Company).create({
        ...input,
        owner: currentUser.id,
      });

      user.auths.add(currentUser);

      await em.persist(user).flush();
      return currentUser;
    } catch (error) {
      throw new AppError(error.message, '404');
    }
  }

  @Directive('@auth')
  @Mutation(() => Company)
  async updateCompany(
    @Arg('input', { nullable: true }) input: UserInput,
    @Arg('image', () => GraphQLUpload, { nullable: true }) image: FileUpload,
    @Ctx() { em, currentUser }: MyContext,
    @Info() info: GraphQLResolveInfo
  ) {
    try {
      if (!currentUser || currentUser.companies.length < 0)
        throw new AppError('No current Company', '404');
      let picture = '';
      if (image) picture = await processUpload(image);

      const { id } = input;

      const relationPaths: string[] = fieldsToRelations(info);

      const company = await em
        .getRepository(Company)
        .findOneOrFail({ id }, relationPaths);

      company.assign({ ...input, picture });

      await em.persist(company).flush();

      return company;
    } catch (error) {
      throw new AppError(error.message, '404');
    }
  }
}
