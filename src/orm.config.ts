import { MikroORM } from '@mikro-orm/core';
import { environment } from './environment';

export default {
  migrations: {
    path: './src/migrations',
    tableName: 'migrations',
    transactional: true,
  },
  tsNode: environment.env === 'development' ? true : false,
  user: 'root',
  password: '',
  dbName: 'afotest',
  host: environment.database,
  port: environment.dbport,
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  type: 'mysql',
} as Parameters<typeof MikroORM.init>[0];
