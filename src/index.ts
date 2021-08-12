import 'reflect-metadata';

import { environment } from './environment';
import { graphqlUploadExpress } from 'graphql-upload';
import { buildSchema } from 'type-graphql';
import { MikroORM } from '@mikro-orm/core';
import express from 'express';
import * as http from 'http';

import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { ApolloServer } from 'apollo-server-express';

import { execute, subscribe } from 'graphql';
import {
  ConnectionContext,
  SubscriptionServer,
} from 'subscriptions-transport-ws';

import Consola from 'consola';
import { join } from 'path';
import ormConfig from './orm.config';
import { AuthProviderResolver } from './resolver/AuthResolver';
import { MyContext } from './utils/interfaces/context.interface';
import { CompanyResolver } from './resolver/CompanyResolver';
import { AppError } from './utils/services/AppError';
import { MessageResolver } from './resolver/MessageResolver';

import path from 'path';
import { ConversationResolver } from './resolver/ConversationResolver';
import { ProductResolver } from './resolver/ProductResolver';
import SearchResolver from './resolver/SearchResolver';
import { authChecker } from './directives/Auth';

const app = express();
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// //Set secure http headers
// app.use(
//   helmet({
//     contentSecurityPolicy: environment.env === 'production' ? undefined : false,
//   })
// );

app.use(cookieParser()); //Limit request from api

// Data sanatization against NoSQL query injection
app.use(mongoSanitize());

// Data sanatization against XSS
app.use(compression());
app.disable('x-powered-by');
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
      resolvers: [
        AuthProviderResolver,
        CompanyResolver,
        MessageResolver,
        ConversationResolver,
        ProductResolver,
        SearchResolver,
      ],
      emitSchemaFile: path.join(__dirname, './schema.graphql'),
      authChecker,
    });

    const server = new ApolloServer({
      schema,
      introspection: environment.apollo.introspection,
      context: ({ req, res }) =>
        ({
          req: req,
          res: res,
          em: orm.em.fork(),
        } as MyContext),
    });
    await server.start();
    // Apply Apollo-Expr,cors: trueess-Server Middlware to express application
    server.applyMiddleware({ app, cors: true });

    const httpServer = http.createServer(app);
    const subscriptionServer = SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
        async onConnect(
          connectionParams: Object,
          webSocket: WebSocket,
          context: ConnectionContext
        ) {
          // If an object is returned here, it will be passed as the `context`
          // argument to your subscription resolvers.
        },
      },
      {
        // This is the `httpServer` we created in a previous step.
        server: httpServer,
        path: server.graphqlPath,
      }
    );

    // ['SIGINT', 'SIGTERM'].forEach((signal) => {
    //   process.on(signal, () => subscriptionServer.close());
    // });

    httpServer.listen(environment.port, () =>
      Consola.success({
        badge: true,
        message: `🚀 Server ready at http://localhost:${environment.port}${server.graphqlPath}`,
      })
    );
  } catch ({ message }) {
    Consola.error({
      badge: true,
      message: message,
    });
  }
};

startApp();
