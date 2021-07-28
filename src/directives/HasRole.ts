import { SchemaDirectiveVisitor } from 'apollo-server-express';
import {
  defaultFieldResolver,
  DirectiveLocation,
  GraphQLDirective,
  GraphQLList,
} from 'graphql';
import { AuthProvider } from '../entity/AuthProvider.entity';
import { Base } from '../entity/BaseEntity';
import { AppError } from '../utils/services/AppError';
import { ensureAuthenticated } from './Auth';

const assertOwner = (user: AuthProvider, data: Base) => {
  if (user.id !== data.owner) {
    throw new AppError('You need to be the owner', '401');
  }
};
export class HasRoleDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName: any, schema: any) {
    return new GraphQLDirective({
      name: 'hasRole',
      locations: [DirectiveLocation.FIELD_DEFINITION],
      args: {
        roles: {
          type: new GraphQLList(schema.getType('Role')),
        },
      },
    });
  }
  visitFieldDefinition(field: any) {
    const { resolve = defaultFieldResolver } = field;

    const roles = this.args.roles;
    const originalResolve = field.resolve || defaultFieldResolver;
    field.resolve = async function (...args: any) {
      const [, , context] = args;
      await ensureAuthenticated(context);

      const userRoles = context.currentUser.role;

      if (roles.indexOf('Owner') !== -1) {
        const data = await originalResolve.apply(this, args);
        assertOwner(context.currentUser, data);
      }

      if (roles.some((role: string) => userRoles.indexOf(role) !== -1)) {
        const result = await resolve.apply(this, args);
        return result;
      }
      throw new AppError('You are not authorized for this resource', '404');
    };
  }
}
