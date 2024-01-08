import "reflect-metadata";
import * as dotenv from "dotenv";
import { JwtConfiguration } from "./utils/JwtConfiguration";
dotenv.config({ path: "../.env" });

const { NODE_ENV } = process.env;

export const AppJwtConfiguration =
    NODE_ENV === "dev"
        ? JwtConfiguration.initDev()
        : JwtConfiguration.initProd("../../certificate/jwt/private-key.pem", "../../certificate/jwt/public-key.pem");
