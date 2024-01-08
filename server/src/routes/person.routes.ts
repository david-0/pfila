import * as express from "express";
import { authentification } from "../middleware/authentification.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { PersonController } from "../controller/PersonController";
const Router = express.Router();

Router.get(
    "/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    PersonController.get
);
Router.get(
    "",
    authentification,
    authorization(["admin"]),
    PersonController.getAll
);
Router.put(
    "/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    PersonController.update
);
Router.post(
    "",
    authentification,
    authorization(["admin"]),
    PersonController.save
);
Router.delete(
    "/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    PersonController.delete
);
Router.get(
    "/withAll/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    PersonController.getWithAll
);
Router.get(
    "/withAll",
    authentification,
    authorization(["admin"]),
    PersonController.getAllWithAll
);
Router.put(
    "/withAll/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    PersonController.update
);
Router.post(
    "/withAll",
    authentification,
    authorization(["admin"]),
    PersonController.save
);
Router.delete(
    "/withAll/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    PersonController.delete
);
export { Router as personRouter };