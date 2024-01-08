import "reflect-metadata";
import { DataSource } from "typeorm";

import * as dotenv from "dotenv";
import { Group } from "./entity/Group";
import { Person } from "./entity/Person";
import { ResetToken } from "./entity/ResetToken";
import { Role } from "./entity/Role";
import { Subgroup } from "./entity/Subgroup";
import { User } from "./entity/User";
import { UserAudit } from "./entity/UserAudit";

dotenv.config({ path: "../.env" });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, NODE_ENV } =
    process.env;

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: parseInt(DB_PORT || "5432"),
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,

    synchronize: NODE_ENV === "dev" ? false : false,
    //logging logs sql command on the treminal
    logging: NODE_ENV === "dev" ? false : false,
    entities: [Group, Person, ResetToken, Role, Subgroup, UserAudit, User],
    migrations: [__dirname + "/migration/*.ts"],
    subscribers: [__dirname + "/subscriber/*.ts"],
});