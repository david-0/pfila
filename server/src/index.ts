
console.log("startup - before init3");
import * as express from "express";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import "reflect-metadata";
import { errorHandler } from "./middleware/error.middleware";
import { apiRouter } from "./routes/api.routes";
import { AppDataSource } from "./app-data-source";
import { personRouter } from "./routes/person.routes";
import { groupRouter } from "./routes/group.routes";
import { roleRouter } from "./routes/role.routes";
import { securityRouter } from "./routes/security.routes";
import { subgroupRouter } from "./routes/subgroup.routes";
import { userRouter } from "./routes/user.routes";
import { userAuditRouter } from "./routes/useraudit.routes";
console.log("startup - before init1");
dotenv.config({ path: "../.env" });

const app = express();
app.use(express.json());
app.use(errorHandler);
const { PORT = 3000 } = process.env;
app.use("/api/person", personRouter);
app.use("/api/group", groupRouter);
app.use("/api/role", roleRouter);
app.use("/api/security", securityRouter);
app.use("/api/subgroup", subgroupRouter);
app.use("/api/user", userRouter);
app.use("/api/useraudit", userAuditRouter);

app.get("*", (req: Request, res: Response) => {
    res.status(505).json({ message: "Bad Request" });
});

console.log("startup - before init");
AppDataSource.initialize()
    .then(async () => {
        app.listen(PORT, () => {
            console.log("Server is running on http://localhost:" + PORT);
        });
        console.log("Data Source has been initialized!");
    })
    .catch((error) => console.log(error));