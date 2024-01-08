import * as express from "express";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import "reflect-metadata";
import { errorHandler } from "./middleware/error.middleware";
import { apiRouter } from "./routes/api.routes";
import { AppDataSource } from "./app-data-source";
console.log("startup - before init1");
dotenv.config({ path: "../.env" });

const app = express();
app.use(express.json());
app.use(errorHandler);
const { PORT = 3000 } = process.env;
app.use("/api", apiRouter);

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