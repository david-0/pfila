
import * as dotenv from "dotenv";
import { configure, getLogger, Logger } from "log4js";

const LOGGER: Logger = getLogger("AppEnv");

dotenv.config();

class MyLogger {
    constructor() {
        configure({
            appenders: { out: { type: "stdout" } },
            categories: { default: { appenders: ["out"], level: "info" } },
        });
        getLogger("MyLogger").info("Logging configured");
    }

    public getLogger(name: string): Logger {
        return getLogger(name);
    }
}

export const AppLogging = new MyLogger();
