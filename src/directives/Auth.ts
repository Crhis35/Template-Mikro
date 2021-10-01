import * as jwt from 'jsonwebtoken';
import { AuthChecker } from 'type-graphql';
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
    req.headers.authorization.startsWith('bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.bearer) {
    token = req.headers.bearer;
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
    .findOne({ id: decoded.id }, ['companies']);
  if (!currUser)
    throw new AppError('The user belong to this token does not exist', '401');
  ctx.currentUser = currUser;
};

// create auth checker function
export const authChecker: AuthChecker<MyContext> = async (
  { context },
  roles
) => {
  await ensureAuthenticated(context);
  const user = context.currentUser;

  if (roles.length === 0) {
    // if `@Authorized()`, check only if user exists
    return user !== undefined;
  }
  // there are some roles defined now

  if (!user) {
    // and if no user, restrict access
    return false;
  }
  if (user.role.some((role) => roles.includes(role))) {
    // grant access if the roles overlap
    return true;
  }

  // no roles matched, restrict access
  return false;
};
