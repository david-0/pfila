import * as express from "express";
import { authentification } from "../middleware/authentification.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { SecurityController } from "../controller/SecurityController";
const Router = express.Router();

Router.post(
    "/login",
    SecurityController.login
);
Router.post(
    "/:id([0-9]+)/changepassword",
    authentification,
    authorization(["admin"]),
    SecurityController.changePassword
);
Router.post(
    "/resetPasswordWithToken",
    SecurityController.resetPasswordWithToken
);
Router.post(
    "/createTokenByEmail",
    SecurityController.createTokenByEmail
);
export { Router as securityRouter };