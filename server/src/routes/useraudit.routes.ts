import * as express from "express";
import { authentification } from "../middleware/authentification.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { UserAuditController } from "../controller/UserAuditController";
const Router = express.Router();

Router.get(
    "",
    authentification,
    authorization(["admin"]),
    UserAuditController.getAll
);
export { Router as userAuditRouter };