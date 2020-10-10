import "../entity/User";

import { Connection, createConnection } from "typeorm";
import { config } from "./";

export async function connect(): Promise<Connection> {
    return createConnection(config.dbConnectionOptions);
}
