import { Router } from "express";
import { RouteBuilder } from "./RouteBuilder";
import { RoleController } from "../controller/RoleController";

export class RoleRouteBuilder {
    public static routes(): Router {
        return new RouteBuilder()
            .get("/:id([0-9]+)", RoleController.get, ["admin"])
            .get("", RoleController.getAll, ["admin"])
            .put("/:id([0-9]+)", RoleController.update, ["admin"])
            .post("", RoleController.save, ["admin"])
            .delete("/:id([0-9]+)", RoleController.delete, ["admin"])
            .get("/withUsers", RoleController.getAllWithUsers, ["admin"])
            .get("/withUsers/:id([0-9]+)", RoleController.getWithUsers, ["admin"])
            .put("/withUsers/:id([0-9]+)", RoleController.update, ["admin"])
            .post("/withUsers", RoleController.save, ["admin"])
            .delete("/withUsers/:id([0-9]+)", RoleController.delete, ["admin"])
            .build();
    }
}
