import * as compression from "compression";
import * as cors from "cors";
import * as fs from "fs";
import * as express from "express";
import * as http from "http";
import * as https from "https";
import { configure, getLogger, Logger } from "log4js";
import * as dotenv from "dotenv";
import "reflect-metadata";

import { ResetTokenEvictor } from "./utils/ResetTokenEvictor";
import { StartupNotifier } from "./utils/StartupNotifier";
import { errorHandler } from "./middleware/error.middleware";
import { AppDataSource } from "./app-data-source";
import { personRouter } from "./routes/person.routes";
import { groupRouter } from "./routes/group.routes";
import { roleRouter } from "./routes/role.routes";
import { userAuditRouter } from "./routes/useraudit.routes";
import { userRouter } from "./routes/user.routes";
import { subgroupRouter } from "./routes/subgroup.routes";
import { securityRouter } from "./routes/security.routes";


const LOGGER: Logger = getLogger("Server");
dotenv.config({ path: "../.env" });

class Server {

  public static bootstrap(): Server {
    LOGGER.info(`startup`);
    return new Server();
  }

  public app: express.Application;
  private server: any;
  private port: number;
  private protocol: string;
  private portHttps: number;
  private portHttp: number;
  private host: string;
  private env: string;

  constructor() {
    configure({
      appenders: { out: { type: "stdout" } },
      categories: { default: { appenders: ["out"], level: "info" } },
    });
    this.config();
    this.app = express();
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(errorHandler);
    AppDataSource.initialize()
      .then(async () => {
        new ResetTokenEvictor().schedule(0);
        this.routes();
        this.staticRoutes();
        this.defaultRoute();
        this.createServer();
        this.app.get("*", (req: express.Request, res: express.Response) => {
          res.status(505).json({ message: "Bad Request" });
        });

        // Start listening
        this.listen();
        new StartupNotifier().notify("david.leuenberger@gmx.ch", this.env + ":" + this.port);
      }).catch(err => {
        LOGGER.error("Create Connection error: {}", err);
      });
  }

  private corsOptions(): cors.CorsOptions {
    let corsOptions: cors.CorsOptions = {};
    if (this.env !== "production") {
      corsOptions = {
        allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
        methods: "POST, GET, PATCH, DELETE, PUT",
        origin: "*",
        preflightContinue: false,
      };
    }
    return corsOptions;
  }

  private createServer() {
    if (this.env === "production" || fs.existsSync("../../certificate/ssl/privkey.pem")) {
      this.redirectHttp();
      this.server = this.createHttpsServer();
    } else {
      this.server = this.createHttpServer();
    }
  }

  private createHttpsServer() {
    LOGGER.info("Start HTTPS server");
    this.port = this.portHttps;
    this.protocol = "https";
    return https.createServer({
      ca: fs.readFileSync("../../certificate/ssl/chain.pem"),
      cert: fs.readFileSync("../../certificate/ssl/cert.pem"),
      key: fs.readFileSync("../../certificate/ssl/privkey.pem"),
    }, this.app);
  }

  private createHttpServer() {
    LOGGER.info("Start HTTP server");
    this.port = this.portHttp;
    this.protocol = "http";
    return http.createServer(this.app);
  }

  private redirectHttp() {
    LOGGER.info(`Redirect from ${this.portHttp} to ${this.portHttps}.`);
    // set up plain http server
    const httpApp = express();
    const httpServer = http.createServer(httpApp);
    httpApp.use("*", this.redirectToHttps);
    httpServer.listen(this.portHttp);
  }

  private redirectToHttps(req: express.Request, res: express.Response, next: express.NextFunction) {
    res.redirect("https://usgwehlt-und-kröönt.ch" + req.url);
  }

  private config(): void {
    this.portHttps = +process.env.PORT || 3002;
    this.portHttp = +process.env.PORT_HTTP || 3001;
    this.host = "localhost";
    this.env = process.env.NODE_ENV || "development";

    if (this.env === "production") {
      this.portHttps = +process.env.PORT || 443;
      this.portHttp = +process.env.PORT_HTTP || 80;
      LOGGER.info(`PRODUCTION-MODE, use private/public keys.`);
    } else {
      LOGGER.info(`DEVELOPMENT-MODE, use shared secret.`);
    }
  }

  private staticRoutes(): void {
    const staticRoutePath = __dirname + "/client";
    if (fs.existsSync(staticRoutePath)) {
      LOGGER.info(`Static-Route: serve files from "/client" in "/"`);
      this.app.use(express.static(__dirname + "/client", { redirect: true }));
    }
  }

  private defaultRoute(): void {
    this.app.get("*", function (req, res) {
      res.sendFile(__dirname + "/client/index.html");
    });
  }

  private routes(): void {
    this.app.use(cors(this.corsOptions()));
    this.app.use("/api/person", personRouter);
    this.app.use("/api/group", groupRouter);
    this.app.use("/api/role", roleRouter);
    this.app.use("/api/security", securityRouter);
    this.app.use("/api/subgroup", subgroupRouter);
    this.app.use("/api/user", userRouter);
    this.app.use("/api/useraudit", userAuditRouter);
  }

  // Start HTTP server listening
  private listen(): void {
    this.server.listen(this.port);

    // // add error handler
    this.server.on("error", this.logError);

    // start listening on port
    this.server.on("listening", () => {
      LOGGER.info(`Pfila server running at ${this.protocol}://${this.host}:${this.port}/`);
    });
  }

  private logError(error: Error) {
    LOGGER.error(`ERROR: ${error.stack}`);
  }
}

// Bootstrap the server
export = Server.bootstrap().app;
