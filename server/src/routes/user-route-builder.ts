import { Router } from "express";
import { RouteBuilder } from "./RouteBuilder";
import { UserController } from "../controller/UserController";
import { SecurityController } from "../controller/SecurityController";

export class UserRouteBuilder {
    public static routes(): Router {
        return new RouteBuilder()
            .post("/changemypassword", SecurityController.changeMyPassword, [])
            .get("/:id([0-9]+)", UserController.get, ["admin"])
            .get("", UserController.getAll, ["admin"])
            .put("/:id([0-9]+)", UserController.update, ["admin"])
            .post("", UserController.save, ["admin"])
            .delete("/:id([0-9]+)", UserController.delete, ["admin"])
            .get("/WithRoles", UserController.getAllWithRoles, ["admin"])
            .get("/WithRoles/:id([0-9]+)", UserController.getWithRoles, ["admin"])
            .put("/WithRoles/:id([0-9]+)", UserController.update, ["admin"])
            .post("/WithRoles", UserController.save, ["admin"])
            .delete("/WithRoles/:id([0-9]+)", UserController.delete, ["admin"])
            .get("/WithRolesAndAudit", UserController.getAllWithRolesAndAudits, ["admin"])
            .get("/WithRolesAndAudit/:id([0-9]+)", UserController.getWithRolesAndAudits, ["admin"])
            .put("/WithRolesAndAudit/:id([0-9]+)", UserController.update, ["admin"])
            .post("/WithRolesAndAudit", UserController.save, ["admin"])
            .delete("/WithRolesAndAudit/:id([0-9]+)", UserController.delete, ["admin"])
            .build();
    }
}
