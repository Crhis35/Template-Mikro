import { Arg, createUnionType, Ctx, Query, Resolver } from 'type-graphql';
import { Company } from '../entity/Company.entity';
import { Product } from '../entity/Product.entity';
import { MyContext } from '../utils/interfaces/context.interface';

const ProductComapnyUnion = createUnionType({
  name: 'ProductComapnyResult', // the name of the GraphQL union
  types: () => [Product, Company] as const, // function that returns tuple of object types classes
});

@Resolver()
class SearchResolver {
  @Query(() => [ProductComapnyUnion])
  async searchCompanyProduct(
    @Arg('phrase') phrase: string,

    @Ctx() { em }: MyContext
  ): Promise<Array<typeof ProductComapnyUnion>> {
    const products = await em.getRepository(Product).find({
      $or: [
        {
          tags: [
            { name: { $like: `%${phrase}%` } },
            { name: { $like: `%${phrase}%` } },
          ],
          name: {
            $like: `%${phrase}%`,
          },
        },
      ],
    });
    const companies = await em.getRepository(Company).find({
      $or: [
        {
          tags: {
            $or: [
              { subject: { $like: `%${phrase}%` } },
              { value: { $like: `%${phrase}%` } },
            ],
          },
          name: {
            $like: `%${phrase}%`,
          },
        },
      ],
    });
    return [...products, ...companies];
  }
}
export default SearchResolver;
