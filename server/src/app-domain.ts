import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const { NODE_ENV } = process.env;

export const AppDomain = NODE_ENV === "dev"
    ? "http://localhost:4200/"
    : "https://usgwehlt-und-kröönt.ch";
