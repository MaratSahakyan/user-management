import * as process from 'process';
import { config } from 'dotenv';
import { IConfig } from './types';

config();

export default () =>
  ({
    app: {
      port: parseInt(process.env.APP_PORT ?? '3000', 10) || 8000,
    },
    db: {
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      autoLoadEntities: true,
    },
  }) as IConfig;
