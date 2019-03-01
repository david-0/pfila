import * as bcrypt from "bcryptjs";
import * as express from "express";
import {Response} from "express";
import {sign} from "jsonwebtoken";
import {Authorized, Body, CurrentUser, HttpError, JsonController, Param, Post, Res} from "routing-controllers";
import {EntityManager, getManager, Transaction, TransactionManager} from "typeorm";
import {Role} from "../entity/Role";
import {User} from "../entity/User";
import {JwtConfiguration} from "../utils/JwtConfiguration";

@JsonController()
export class SecurityController {

  // TODO Inject as Service
  private jwtConfig: JwtConfiguration;

  constructor() {
    this.jwtConfig = new JwtConfiguration("development");
  }

  @Post("/api/authenticate")
  public async authenticateEndpoint(@Body() body: any): Promise<any> {
    const user = await this.checkLogin(body.email, body.password);
    if (!!user && (typeof user !== "string")) {
      return {token: this.createToken(user)};
    }
//            res.status(500).json({error: `error creating token for user: ${email}. ${err}`});
//          console.info("login NOT successfull --> fake admin user");
    return {token: this.createToken(this.createTestingAdminUser(body.email))};
  }

  @Authorized("admin")
  @Post("/api/user/:id([0-9]+)/changepassword")
  public addChangePasswordEndpoint(@Param("id") userId: number, @Body() body: any, @Res() res: Response) {
    return this.changePassword(userId, body.password);
  }

  @Post("/api/user/changemypassword")
  @Transaction()
  public async addChangeMyPasswordEndpoint(@TransactionManager() manager: EntityManager,
                                           @CurrentUser({required: true}) userId: number, @Body() body: any, @Res() res: Response) {
    return this.changeMyPassword(manager, userId, body.currentPassword, body.password);
  }

  private async changeMyPassword(manager: EntityManager, userId: number, currentPassword: string, password: string): Promise<User> {
    const user = await this.findUserbyId(userId, manager);
    const ok: boolean = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return Promise.reject(new HttpError(401, "password not changed"));
    }
    await this.updatePassword(user.id, password, manager);
    return user;
  }


  private async changePassword(userId: number, password: string): Promise<User> {
    const user = await this.findUserbyId(userId, getManager());
    await this.updatePassword(user.id, password, getManager());
    return user;
  }

  private async updatePassword(userId: number, password: string, manager: EntityManager): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);
    const update = await manager.getRepository(User).update({id: userId}, {password: passwordHash});
    return;
  }

  private findUserbyId(userId: number, manager: EntityManager): Promise<User> {
    return manager.getRepository(User).findOne({id: userId});
  }

  private async findUserbyEmail(emailAddress: string): Promise<User> {
    return getManager().getRepository(User)
      .createQueryBuilder("user")
      .addSelect("user.password")
      .leftJoinAndSelect("user.roles", "roles")
      .where("user.email = :email", {email: emailAddress})
      .getOne();
  }

  private requiresAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const valid: boolean = req.user && (req.user.roles.map((r: Role) => r.name)
      .filter((n: string) => n === "admin"));
    if (valid) {
      next();
    } else {
      res.status(403).json({error: `not authorized to use ${req.baseUrl}`});
    }
  }

  private async checkLogin(email: string, password: string): Promise<any> {
    const user = await this.findUserbyEmail(email);
    if (!!user) {
      const ok: boolean = await bcrypt.compare(password, user.password);
      if (ok) {
        return user;
      }
    }
    return new Promise<string>((resolve, reject) => resolve("Login not successful!"));
  }

  /**
   * TODO: remove before production
   */
  private createTestingAdminUser(email: string): User {
    const role = new Role();
    role.name = "admin";
    const saleRole = new Role();
    saleRole.name = "standard";
    const storeRole = new Role();
    storeRole.name = "guest";
    const user = new User();
    user.email = email;
    user.roles = [role, saleRole, storeRole];
    return user;
  }

  private createToken(user: User): string {
    const roles = user.roles.map(role => role.name);
    return sign({id: user.id, roles},
      this.jwtConfig.getSignSecret(), this.jwtConfig.getSignOptions());
  }
}

declare global {
  namespace Express {
    export interface Request {
      user?: any
    }
  }
}
