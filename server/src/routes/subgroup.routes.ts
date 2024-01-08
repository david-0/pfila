import * as express from "express";
import { authentification } from "../middleware/authentification.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { SubgroupController } from "../controller/SubgroupController";
const Router = express.Router();

Router.get(
    "/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    SubgroupController.get
);
Router.get(
    "",
    authentification,
    authorization(["admin"]),
    SubgroupController.getAll
);
Router.put(
    "/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    SubgroupController.update
);
Router.post(
    "",
    authentification,
    authorization(["admin"]),
    SubgroupController.save
);
Router.delete(
    "/:id([0-9]+)",
    authentification,
    authorization(["admin"]),
    SubgroupController.delete
);

export { Router as subgroupRouter };