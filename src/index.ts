import 'reflect-metadata';

import { environment } from './environment';
import { graphqlUploadExpress } from 'graphql-upload';
import { buildSchema } from 'type-graphql';
import { Dictionary, IPrimaryKey, MikroORM } from '@mikro-orm/core';
import express from 'express';
import * as http from 'http';

import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'x-xss-protection';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { ApolloServer, SchemaDirectiveVisitor } from 'apollo-server-express';

import Consola from 'consola';
import { join } from 'path';
import ormConfig from './orm.config';
import { AuthProviderResolver } from './resolver/AuthResolver';
import { MyContext } from './utils/interfaces/context.interface';
import { AuthDirective } from './directives/Auth';
import { HasRoleDirective } from './directives/HasRole';
import { UserResolver } from './resolver/UserResolver';
import { AppError } from './utils/services/AppError';
import { MessageResolver } from './resolver/MessageResolver';

const app = express();
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Set secure http headers
app.use(
  helmet({
    contentSecurityPolicy: environment.env === 'production' ? undefined : false,
  })
);

app.use(cookieParser()); //Limit request from api

// Data sanatization against NoSQL query injection
app.use(mongoSanitize());

// Data sanatization against XSS
app.use(xss());
app.use(compression());
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(express.static(join(__dirname, './images')));
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

const startApp = async () => {
  try {
    const orm = await MikroORM.init({
      ...ormConfig,
      findOneOrFailHandler: (entityName: string) => {
        return new AppError(`${entityName} not found!`, '404');
      },
    });
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    if (migrations && migrations.length > 0) {
      await migrator.up();
    }

    Consola.success({
      badge: true,
      message: `Successfully connected with the database`,
    });

    const schema = await buildSchema({
      resolvers: [AuthProviderResolver, UserResolver, MessageResolver],
    });

    SchemaDirectiveVisitor.visitSchemaDirectives(schema, {
      auth: AuthDirective,
      hasRole: HasRoleDirective,
    });

    const server = new ApolloServer({
      schema,
      uploads: false,
      introspection: environment.apollo.introspection,
      playground: environment.apollo.playground,
      subscriptions: {
        path: '/subscriptions',
      },
      context: ({ req, res }) =>
        ({
          req: req,
          res: res,
          em: orm.em.fork(),
        } as MyContext),
    });
    // Apply Apollo-Expr,cors: trueess-Server Middlware to express application
    server.applyMiddleware({ app, cors: true });

    const httpServer = http.createServer(app);
    server.installSubscriptionHandlers(httpServer);
    httpServer.listen(environment.port, () =>
      Consola.success({
        badge: true,
        message: `🚀 Server ready at http://localhost:${environment.port}${server.graphqlPath}`,
      })
    );
  } catch (error) {
    Consola.error({
      badge: true,
      message: error.message,
    });
  }
};

startApp();
