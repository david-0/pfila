import * as compression from "compression";
import * as cors from "cors";
import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as http from "http";
import * as https from "https";
import { Logger } from "log4js";
import "reflect-metadata";

import { ResetTokenEvictor } from "./utils/ResetTokenEvictor";
import { StartupNotifier } from "./utils/StartupNotifier";
import { errorHandler } from "./middleware/error.middleware";
import { AppDataSource } from "./utils/app-data-source";
import { AppEnv } from "./utils/app-env";
import { PersonRouteBuilder } from "./routes/person-route-builder";
import { GroupRouteBuilder } from "./routes/group-route-builder";
import { RoleRouteBuilder } from "./routes/role-route-builder";
import { SecurityRouteBuilder } from "./routes/security-route-builder";
import { SubgroupRouteBuilder } from "./routes/subgroup-route-builder";
import { UserRouteBuilder } from "./routes/user-route-builder";
import { UserAuditRouteBuilder } from "./routes/useraudit-route-builder";
import { AppLogging } from "./utils/app-logging";

const LOGGER: Logger = AppLogging.getLogger("Server");

class Server {

  public static bootstrap(): Server {
    return new Server();
  }

  public app: express.Application;
  private server: any;

  constructor() {
    this.logServerType();
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

        // Start listening
        this.listen();
        new StartupNotifier().notify("david.leuenberger@gmx.ch", AppEnv.getUrl());
      }).catch(err => {
        LOGGER.error("Create Connection error: {}", err);
      });
  }

  private corsOptions(): cors.CorsOptions {
    let corsOptions: cors.CorsOptions = {};
    if (AppEnv.prod) {
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
    if (AppEnv.prod) {
      this.redirectHttp();
      this.server = this.createHttpsServer();
    } else {
      this.server = this.createHttpServer();
    }
  }

  private createHttpsServer() {
    LOGGER.info("Start HTTPS server");
    return https.createServer({
      ca: fs.readFileSync("../../certificate/ssl/chain.pem"),
      cert: fs.readFileSync("../../certificate/ssl/cert.pem"),
      key: fs.readFileSync("../../certificate/ssl/privkey.pem"),
    }, this.app);
  }

  private createHttpServer() {
    LOGGER.info("Start HTTP server");
    return http.createServer(this.app);
  }

  private redirectHttp() {
    LOGGER.info(`Redirect from ` + AppEnv.portHttp + ` to ` + AppEnv.portHttps + `.`);
    // set up plain http server
    const httpApp = express();
    const httpServer = http.createServer(httpApp);
    httpApp.use("*", this.redirectToHttps);
    httpServer.listen(AppEnv.portHttp);
  }

  private redirectToHttps(req: express.Request, res: express.Response, next: express.NextFunction) {
    res.redirect(AppEnv.getUrl() + req.url);
  }

  private logServerType(): void {
    if (AppEnv.prod) {
      LOGGER.info(`PRODUCTION-MODE, use private/public keys.`);
    } else {
      LOGGER.info(`DEVELOPMENT-MODE, use shared secret.`);
    }
  }

  private staticRoutes(): void {
    const staticRoutePath = path.join(__dirname, "client");
    if (fs.existsSync(staticRoutePath)) {
      LOGGER.info(`Static-Route: serve files from "/client" in "/"`);
      this.app.use(express.static(staticRoutePath));
    }
  }

  private defaultRoute(): void {
    this.app.get("*", function (req, res) {
      res.sendFile(path.join(__dirname, "client", "index.html"));
    });
  }

  private routes(): void {
    this.app.use(cors(this.corsOptions()));
    this.app.use("/api/person", PersonRouteBuilder.routes());
    this.app.use("/api/group", GroupRouteBuilder.routes());
    this.app.use("/api/role", RoleRouteBuilder.routes());
    this.app.use("/api/security", SecurityRouteBuilder.routes());
    this.app.use("/api/subgroup", SubgroupRouteBuilder.routes());
    this.app.use("/api/user", UserRouteBuilder.routes());
    this.app.use("/api/useraudit", UserAuditRouteBuilder.routes());
  }

  // Start HTTP server listening
  private listen(): void {
    this.server.listen(AppEnv.getPort());

    // // add error handler
    this.server.on("error", this.logError);

    // start listening on port
    this.server.on("listening", () => {
      LOGGER.info("Pfila server running at " + AppEnv.getUrl());
    });
  }

  private logError(error: Error) {
    LOGGER.error(`ERROR: ${error.stack}`);
  }
}

// Bootstrap the server
export = Server.bootstrap().app;
