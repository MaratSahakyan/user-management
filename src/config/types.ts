export interface IAppConfig {
  port: number;
}

export interface IDbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  synchronize: boolean;
}

export interface IConfig {
  app: IAppConfig;
  db: IDbConfig;
}
