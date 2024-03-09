import { Router } from "express";
import { RouteBuilder } from "./RouteBuilder";
import { PersonController } from "../controller/PersonController";

export class PersonRouteBuilder {
    public static routes(): Router {
        return new RouteBuilder()
            .get("/:id([0-9]+)", PersonController.get, ["admin"])
            .get("", PersonController.getAll, ["admin"])
            .put("/:id([0-9]+)", PersonController.update, ["admin"])
            .post("", PersonController.save, ["admin"])
            .delete("/:id([0-9]+)", PersonController.delete, ["admin"])
            .get("/withAll", PersonController.getAllWithAll, ["admin"])
            .get("/withAll/:id([0-9]+)", PersonController.getWithAll, ["admin"])
            .put("/withAll/:id([0-9]+)", PersonController.update, ["admin"])
            .post("/withAll", PersonController.save)
            .delete("/withAll/:id([0-9]+)", PersonController.delete, ["admin"])
            .build();
    }
}
