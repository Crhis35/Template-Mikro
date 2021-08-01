import { Resolver } from 'type-graphql';

import { createBaseResolver } from './BaseResolver';
import { Product } from '../entity/Product.entity';

const ProductBaseResolver = createBaseResolver('Product', Product);

@Resolver(Product)
export class ProductResolver extends ProductBaseResolver {}
