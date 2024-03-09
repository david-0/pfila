import { Router } from "express";
import { RouteBuilder } from "./RouteBuilder";
import { SubgroupController } from "../controller/SubgroupController";

export class SubgroupRouteBuilder {
    public static routes(): Router {
        return new RouteBuilder()
            .get("/:id([0-9]+)", SubgroupController.get, ["admin"])
            .get("", SubgroupController.getAll, ["admin"])
            .put("/:id([0-9]+)", SubgroupController.update, ["admin"])
            .post("", SubgroupController.save, ["admin"])
            .delete("/:id([0-9]+)", SubgroupController.delete, ["admin"])
            .build();
    }
}
