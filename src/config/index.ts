import * as fs from "fs";
import { ConnectionOptions } from "typeorm";
import { sys } from "typescript";

export enum EnvType {
    production,
    development,
    test,
}

export interface IConfig {
    env: EnvType;
    port: number;
    jwtSecret: string;
    dbConnectionOptions: ConnectionOptions | null;
}

const production: IConfig = {
    env: EnvType.production,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    jwtSecret: ((): string => {
        if (process.env.JWT_SECRET === undefined) {
            console.log("JWT_SECRET is not set");
            process.exit(1);
        }
        return process.env.JWT_SECRET;
    })(),
    dbConnectionOptions: null,
};

const development: IConfig = {
    ...production,
    env: EnvType.development,
    jwtSecret: "DEVSECRET",
    dbConnectionOptions:
        process.env.NODE_ENV === "development"
            ? fs.existsSync("./ormconfig.dev.json")
                ? (JSON.parse(
                      fs.readFileSync("./ormconfig.dev.json").toString(),
                  ) as ConnectionOptions)
                : null
            : null,
};

const test: IConfig = {
    ...production,
    env: EnvType.test,
    jwtSecret: "TESTSECRET",
    dbConnectionOptions:
        process.env.NODE_ENV === "test"
            ? process.env.CI
                ? (JSON.parse(
                      fs.readFileSync("./ormconfig.ci.json").toString(),
                  ) as ConnectionOptions)
                : (JSON.parse(
                      fs.readFileSync("./ormconfig.test.json").toString(),
                  ) as ConnectionOptions)
            : null,
};

const envs: { [key: string]: IConfig } = { production, development, test };
const env = process.env.NODE_ENV || "production";
const currentConfig = envs[env];

export { currentConfig as config };
