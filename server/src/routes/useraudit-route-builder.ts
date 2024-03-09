import { Router } from "express";
import { RouteBuilder } from "./RouteBuilder";
import { UserAuditController } from "../controller/UserAuditController";

export class UserAuditRouteBuilder {
    public static routes(): Router {
        return new RouteBuilder()
            .get("/:id([0-9]+)", UserAuditController.getAll, ["admin"])
            .build();
    }
}
