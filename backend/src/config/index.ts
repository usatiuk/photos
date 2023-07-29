import * as fs from "fs";
import { ConnectionOptions } from "typeorm";

export enum EnvType {
    production,
    development,
    test,
}

export interface IConfig {
    env: EnvType;
    port: number;
    jwtSecret: string;
    dataDir: string;
    https: boolean;
    dbConnectionOptions: ConnectionOptions | null;
}

function getJwtSecret(): string {
    switch (process.env.NODE_ENV) {
        case "development":
            return "DEVSECRET";
            break;
        case "test":
            return "TESTSECRET";
            break;
        case "production":
        default:
            if (process.env.JWT_SECRET === undefined) {
                console.log("JWT_SECRET is not set");
                process.exit(1);
            } else {
                return process.env.JWT_SECRET;
            }
            break;
    }
}

function getDataDir(): string {
    switch (process.env.NODE_ENV) {
        case "development":
            return "./data_dev";
            break;
        case "test":
            return "./data_test";
            break;

        case "production":
        default:
            if (process.env.DATA_DIR === undefined) {
                console.log("DATA_DIR is not set");
                process.exit(1);
            } else {
                return process.env.DATA_DIR;
            }
            break;
    }
}

const production: IConfig = {
    env: EnvType.production,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    https: process.env.HTTPS ? process.env.HTTPS === "yes" : false,
    jwtSecret: getJwtSecret(),
    dataDir: getDataDir(),
    dbConnectionOptions: null,
};

const development: IConfig = {
    ...production,
    env: EnvType.development,
};

const test: IConfig = {
    ...production,
    env: EnvType.test,
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
