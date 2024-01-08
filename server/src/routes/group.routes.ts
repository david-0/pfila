import * as express from "express";
import { authentification } from "../middleware/authentification.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { GroupController } from "../controller/GroupController";
const Router = express.Router();

Router.get(
    "/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    GroupController.get
);
Router.get(
    "",
    authentification,
    authorization(["admin"]),
    GroupController.getAll
);
Router.put(
    "/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    GroupController.update
);
Router.post(
    "",
    authentification,
    authorization(["admin"]),
    GroupController.save
);
Router.delete(
    "/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    GroupController.delete
);
Router.get(
    "/withSubgroups/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    GroupController.getWithSubgroups
);
Router.get(
    "/withSubgroups",
    GroupController.getAllWithSubgroups
);
Router.put(
    "/withSubgroups/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    GroupController.update
);
Router.post(
    "/withSubgroups",
    authentification,
    authorization(["admin"]),
    GroupController.save
);
Router.delete(
    "/withSubgroups/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    GroupController.delete
);
export { Router as groupRouter };