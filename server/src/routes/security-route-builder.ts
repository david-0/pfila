import { Router } from "express";
import { RouteBuilder } from "./RouteBuilder";
import { SecurityController } from "../controller/SecurityController";

export class SecurityRouteBuilder {
    public static routes(): Router {
        return new RouteBuilder()
            .post("/login", SecurityController.login)
            .post("/:id([0-9]+)/changepassword", SecurityController.changePassword, ["admin"])
            .post("/resetPasswordWithToken", SecurityController.resetPasswordWithToken)
            .post("/createTokenByEmail", SecurityController.createTokenByEmail)
            .build();
    }
}
