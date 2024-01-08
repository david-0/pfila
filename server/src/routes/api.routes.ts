import * as express from "express";
import { userRouter } from "./user.routes";
import { securityRouter } from "./security.routes";
import { groupRouter } from "./group.routes";
import { roleRouter } from "./role.routes";
import { subgroupRouter } from "./subgroup.routes";
import { userAuditRouter } from "./useraudit.routes";
import { personRouter } from "./person.routes";

const Router = express.Router();

// Router.use("/person", personRouter);
// Router.use("/group", groupRouter);
// Router.use("/role", roleRouter);
// Router.use("/security", securityRouter);
// Router.use("/subgroup", subgroupRouter);
// Router.use("/user", userRouter);
// Router.use("/useraudit", userAuditRouter);

export { Router as apiRouter };