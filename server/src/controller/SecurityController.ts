import * as bcrypt from "bcryptjs";
import * as express from "express";
import {Response} from "express";
import {sign} from "jsonwebtoken";
import * as moment from "moment";
import {Authorized, Body, CurrentUser, HttpError, JsonController, Param, Post, Res} from "routing-controllers";
import {EntityManager, getManager, Transaction, TransactionManager} from "typeorm";
import {v4 as uuid} from "uuid";
import {ResetToken} from "../entity/ResetToken";
import {Role} from "../entity/Role";
import {User} from "../entity/User";
import {JwtConfiguration} from "../utils/JwtConfiguration";
import {MailService} from "../utils/MailService";

declare var process: any;

@JsonController()
export class SecurityController {

  // TODO Inject as Service
  private jwtConfig: JwtConfiguration;
  private mailService: MailService;

  constructor() {
    const env = process.env.NODE_ENV || "development";
    this.jwtConfig = new JwtConfiguration(env);
    this.mailService = new MailService("../../configuration/smtp.json");
  }

  @Post("/api/authenticate")
  public async authenticateEndpoint(@Body() body: any): Promise<any> {
    const user = await this.checkLogin(body.email, body.password);
    if (!!user && (typeof user !== "string")) {
      return {token: this.createToken(user)};
    }
    return Promise.reject("login NOT successfull");
  }

  @Authorized("admin")
  @Post("/api/user/:id([0-9]+)/changepassword")
  public addChangePasswordEndpoint(@Param("id") userId: number, @Body() body: any, @Res() res: Response) {
    return this.changePassword(userId, body.password);
  }

  @Authorized()
  @Post("/api/user/changemypassword")
  @Transaction()
  public async addChangeMyPasswordEndpoint(@TransactionManager() manager: EntityManager,
                                           @CurrentUser({required: true}) userId: number, @Body() body: any, @Res() res: Response) {
    return this.changeMyPassword(manager, userId, body.currentPassword, body.password);
  }

  @Post("/api/user/changepasswordbytoken")
  @Transaction()
  public async addChangePasswordByTokenEndpoint(@TransactionManager() manager: EntityManager, @Body() body: any, @Res() res: Response) {
    const user = await this.findUserByToken(manager, body.token);
    if (user) {
      await this.updatePassword(user.id, body.password, manager);
      return user;
    }
    return Promise.reject(new HttpError(401, "Token not valid"));
  }

  @Post("/api/user/createTokenByEmail")
  @Transaction()
  public async createTokenByEmailEndpoint(@TransactionManager() manager: EntityManager, @Body() body: any, @Res() res: Response): Promise<void> {
    const user = await this.findUserbyEmail(body.email);
    if (user) {
      const resetToken = new ResetToken();
      resetToken.user = user;
      resetToken.token = uuid();
      resetToken.validTo = moment().add(2, "h").toDate();
      const insertResult = await manager.getRepository(ResetToken).insert(resetToken);
      await this.sendResetToken(user, resetToken.token);
    }
    return;
  }

  private async changeMyPassword(manager: EntityManager, userId: number, currentPassword: string, password: string): Promise<User> {
    const user = await this.findUserbyId(userId, manager);
    const userPassword = await this.getUserPassword(userId, manager);
    const ok: boolean = await bcrypt.compare(currentPassword, userPassword.password);
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

  private getUserPassword(userId: number, manager: EntityManager): Promise<User> {
    return manager.getRepository(User).findOne({id: userId}, {select: ['password']});
  }

  private async findUserByToken(manager: EntityManager, token: string): Promise<User | undefined> {
    const resetToken = await manager.getRepository(ResetToken).findOne({id: token}, {relations: ["user"]});
    if (resetToken && (resetToken.validTo <= new Date())) {
      return resetToken.user;
    }
    return undefined;
  }

  private async findUserbyEmail(emailAddress: string): Promise<User | undefined> {
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

  private createToken(user: User): string {
    const roles = user.roles.map(role => role.name);
    return sign({id: user.id, roles},
      this.jwtConfig.getSignSecret(), this.jwtConfig.getSignOptions());
  }

  private async sendResetToken(user: User, token: string) {
    await this.mailService.sendMail(user.email, "david.leuenberger@gmx.ch", "resetToken",
      "Hallo\r\nResetlink: https://uf-und-drvoo.ch/resetPassword/"+token,
      "<p>Hallo<br/><a href='https://uf-und-drvoo.ch/resetPassword/"+token+"'>reset password</a>");
  }
}

declare global {
  namespace Express {
    export interface Request {
      user?: any
    }
  }
}
