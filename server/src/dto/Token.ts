import { IntegerType } from "typeorm";

export type payload = {
    id: number;
    roles: string[];
    groups: string[];
  };