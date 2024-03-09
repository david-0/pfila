import { Router } from "express";
import { RouteBuilder } from "./RouteBuilder";
import { GroupController } from "../controller/GroupController";

export class GroupRouteBuilder {
    public static routes(): Router {
        return new RouteBuilder()
            .get("/:id([0-9]+)", GroupController.get, ["admin"])
            .get("", GroupController.getAll, ["admin"])
            .put("/:id([0-9]+)", GroupController.update, ["admin"])
            .post("", GroupController.save, ["admin"])
            .delete("/:id([0-9]+)", GroupController.delete, ["admin"])
            .get("/withSubgroups", GroupController.getAllWithSubgroups)
            .get("/withSubgroups/:id([0-9]+)", GroupController.getWithSubgroups, ["admin"])
            .put("/withSubgroups/:id([0-9]+)", GroupController.update, ["admin"])
            .post("/withSubgroups", GroupController.save, ["admin"])
            .delete("/withSubgroups/:id([0-9]+)", GroupController.delete, ["admin"])
            .build();
    }
}
