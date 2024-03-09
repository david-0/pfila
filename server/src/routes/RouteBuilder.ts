import * as jwt from "jsonwebtoken";
import { AppJwtConfiguration } from "../utils/app-jwt-configuration";
import { Request, Response, NextFunction, Router } from "express";
import { AppDataSource } from "../utils/app-data-source";
import { QueryFailedError } from "typeorm";
import { getLogger, Logger } from "log4js";

const LOGGER: Logger = getLogger("RouteBuilder");

export class RouteBuilder {
    private router: Router;
    constructor() {
        this.router = Router();
    }

    public build(): Router {
        return this.router;
    };

    public get(url: string, callback: (req: Request, res: Response, next: NextFunction) => any, roles: string[] = undefined): RouteBuilder {
        if (Array.isArray(roles)) {
            if (!roles.length) {
                this.router.get(url,
                    async (req, res, next) => this.authentification(req, res, next),
                    async (req, res, next) => this.exceptionHandler(req, res, next,
                        async (req, res, next) => callback(req, res, next)));        
            } else {
                this.router.get(url,
                    async (req, res, next) => this.authentification(req, res, next),
                    async (req, res, next) => this.authorization(roles, req, res, next),
                    async (req, res, next) => this.exceptionHandler(req, res, next,
                        async (req, res, next) => callback(req, res, next)));        
            }
        } else {
            this.router.get(url,
                async (req, res, next) => this.exceptionHandler(req, res, next,
                    async (req, res, next) => callback(req, res, next)));    
        }
        return this;
    }
    public put(url: string, callback: (req: Request, res: Response, next: NextFunction) => any, roles: string[] = undefined): RouteBuilder {
        if (Array.isArray(roles)) {
            if (!roles.length) {
                this.router.put(url,
                    async (req, res, next) => this.authentification(req, res, next),
                    async (req, res, next) => this.exceptionHandler(req, res, next,
                        async (req, res, next) => callback(req, res, next)));        
            } else {
                this.router.put(url,
                    async (req, res, next) => this.authentification(req, res, next),
                    async (req, res, next) => this.authorization(roles, req, res, next),
                    async (req, res, next) => this.exceptionHandler(req, res, next,
                        async (req, res, next) => callback(req, res, next)));        
            }
        } else {
            this.router.put(url,
                async (req, res, next) => this.exceptionHandler(req, res, next,
                    async (req, res, next) => callback(req, res, next)));    
        }
        return this;
    }

    public post(url: string, callback: (req: Request, res: Response, next: NextFunction) => any, roles: string[] = undefined): RouteBuilder {
        if (Array.isArray(roles)) {
            if (!roles.length) {
                this.router.post(url,
                    async (req, res, next) => this.authentification(req, res, next),
                    async (req, res, next) => this.exceptionHandler(req, res, next,
                        async (req, res, next) => callback(req, res, next)));        
            } else {
                this.router.post(url,
                    async (req, res, next) => this.authentification(req, res, next),
                    async (req, res, next) => this.authorization(roles, req, res, next),
                    async (req, res, next) => this.exceptionHandler(req, res, next,
                        async (req, res, next) => callback(req, res, next)));        
            }
        } else {
            this.router.post(url,
                async (req, res, next) => this.exceptionHandler(req, res, next,
                    async (req, res, next) => callback(req, res, next)));    
        }
        return this;
    }

    public delete(url: string, callback: (req: Request, res: Response, next: NextFunction) => any, roles: string[] = undefined): RouteBuilder {
        if (Array.isArray(roles)) {
            if (!roles.length) {
                this.router.delete(url,
                    async (req, res, next) => this.authentification(req, res, next),
                    async (req, res, next) => this.exceptionHandler(req, res, next,
                        async (req, res, next) => callback(req, res, next)));        
            } else {
                this.router.delete(url,
                    async (req, res, next) => this.authentification(req, res, next),
                    async (req, res, next) => this.authorization(roles, req, res, next),
                    async (req, res, next) => this.exceptionHandler(req, res, next,
                        async (req, res, next) => callback(req, res, next)));        
            }
        } else {
            this.router.delete(url,
                async (req, res, next) => this.exceptionHandler(req, res, next,
                    async (req, res, next) => callback(req, res, next)));    
        }
        return this;
    }

    private async exceptionHandler(req: Request, res: Response, next: NextFunction,
        callback: (req: Request, res: Response, next: NextFunction) => any) {
        try {
            return await callback(req, res, next);
        } catch (error) {
            LOGGER.warn(JSON.stringify(error));
            if (error instanceof QueryFailedError) {
                return res.status(500).send("Fehler bei der Datenbankabfrage.");
            }
            return res.status(500).send("Unbekannter Fehler");
        }
    }

    private async authentification(req: Request, res: Response, next: NextFunction) {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = header.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decode = jwt.verify(token, AppJwtConfiguration.signSecret);
        if (!decode) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req["currentUser"] = decode;
        next();
    };

    private async authorization(roles: string[], req: Request, res: Response, next: NextFunction) {
        return await AppDataSource.transaction(async (manager) => {
            const user = req["currentUser"];
            if (!(user && (!roles.length ||
                roles.filter(role => user.roles.indexOf(role) !== -1).length > 0))) {
                return res.status(403).json({ message: "Forbidden" });
            }
            next();
        });
    };

}