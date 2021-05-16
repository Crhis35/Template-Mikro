import { SchemaDirectiveVisitor } from 'apollo-server-express';
import { defaultFieldResolver } from 'graphql';
import jwt from 'jsonwebtoken';
import { AuthProvider } from '../entity/AuthProvider.entity';
import { environment } from '../environment';
import { MyContext } from '../utils/interfaces/context.interface';
import { AppError } from '../utils/services/AppError';

export const ensureAuthenticated = async (ctx: MyContext) => {
  //1) Getting token and check if it's there
  const req = ctx.req;
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    throw new AppError(
      'You are not logged in! Please log in to get access',
      '401'
    );
  }
  //2) validate token
  const decoded = <any>jwt.verify(token, environment.jwtSecret);

  //3) check if user still exits
  const currUser = await ctx.em
    .getRepository(AuthProvider)
    .findOne({ id: decoded.id }, ['user']);
  if (!currUser)
    throw new AppError('The user belong to this token does not exist', '401');
  ctx.currentUser = currUser;
};

export class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: any) {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function (...args: any) {
      const [, , context] = args;
      await ensureAuthenticated(context);
      return resolve.apply(this, args);
    };
  }
}
