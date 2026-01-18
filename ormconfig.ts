import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

export const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
});
