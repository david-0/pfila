import "reflect-metadata";
import { DataSource } from "typeorm";

import { Group } from "../entity/Group";
import { Person } from "../entity/Person";
import { ResetToken } from "../entity/ResetToken";
import { Role } from "../entity/Role";
import { Subgroup } from "../entity/Subgroup";
import { User } from "../entity/User";
import { UserAudit } from "../entity/UserAudit";
import { AppEnv } from "./app-env";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: AppEnv.dbHost,
    port: AppEnv.dbPort,
    username: AppEnv.dbUsername,
    password: AppEnv.dbPassword,
    database: AppEnv.dbDatabase,

    synchronize: AppEnv.prod ? false : false,
    //logging logs sql command on the treminal
    logging: AppEnv.prod ? false : false,
    migrationsRun: true,
    entities: [Group, Person, ResetToken, Role, Subgroup, UserAudit, User],
    migrations: [__dirname + "/../migration/*.ts"],
    subscribers: [__dirname + "/../subscriber/*.ts"],
});
