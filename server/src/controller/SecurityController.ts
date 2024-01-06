import * as bcrypt from "bcryptjs";
import * as express from "express";
import { sign } from "jsonwebtoken";
import { getLogger, Logger } from "log4js";
import * as moment from "moment";
import { Authorized, Body, CurrentUser, HttpError, JsonController, Param, Post, Req } from "routing-controllers";
import { EntityManager, getManager, Repository, Transaction, TransactionManager } from "typeorm";
import { v4 as uuid } from "uuid";
import { ResetToken } from "../entity/ResetToken";
import { Role } from "../entity/Role";
import { User } from "../entity/User";
import { UserAudit } from "../entity/UserAudit";
import { JwtConfiguration } from "../utils/JwtConfiguration";
import { MailService } from "../utils/MailService";

declare var process: any;

@JsonController()
export class SecurityController {

  private LOGGER: Logger = getLogger("SecurityController");

  // TODO Inject as Service
  private jwtConfig: JwtConfiguration;
  private mailService: MailService;

  private userAuditRepository: Repository<UserAudit>;
  private env: string;

  constructor() {
    this.env = process.env.NODE_ENV || "development";
    this.jwtConfig = new JwtConfiguration(this.env);
    if (this.env === "production") {
      this.jwtConfig.initProd("../../certificate/jwt/private-key.pem", "../../certificate/jwt/public-key.pem");
    }
    this.mailService = new MailService("../../configuration/smtp.json");
    this.userAuditRepository = getManager().getRepository(UserAudit);
  }

  @Post("/api/authenticate")
  public async authenticateEndpoint(@Req() request: express.Request, @Body() body: any): Promise<any> {
    const user = await this.findUserbyEmail(body.email);
    if (!user) {
      await this.authenticateAudit("not registered", user, body, request);
      return Promise.reject("login NOT successfull");
    }
    const checkedUser = await this.checkLogin(user, body.password);
    if (!!checkedUser && (typeof checkedUser !== "string")) {
      await this.authenticateAudit("success", checkedUser, body, request);
      return { token: this.createToken(checkedUser) };
    }
    await this.authenticateAudit("password failed", user, body, request);
    return Promise.reject("login NOT successfull");
  }

  private async authenticateAudit(actionResult: string, user, body: any, request: express.Request): Promise<void> {
    const audit = {
      user,
      action: "authenticate",
      actionResult: actionResult,
      additionalData: body.email,
    };
    await this.userAuditRepository.save(audit, { data: request });
  }


  @Authorized("admin")
  @Post("/api/user/:id([0-9]+)/changepassword")
  public async addChangePasswordEndpoint(@CurrentUser({ required: true }) currentUserId: number,
    @Param("id") userId: number, @Body() body: any, @Req() request: express.Request) {
    return await this.changePassword(currentUserId, userId, body.password, request);
  }

  @Authorized()
  @Post("/api/user/changemypassword")
  @Transaction()
  public async addChangeMyPasswordEndpoint(@TransactionManager() manager: EntityManager,
    @CurrentUser({ required: true }) userId: number, @Body() body: any, @Req() request: express.Request) {
    return await this.changeMyPassword(manager, userId, body.currentPassword, body.password, request);
  }

  @Post("/api/user/resetPasswordWithToken")
  @Transaction()
  public async resetPasswordWithTokenEndpoint(@TransactionManager() manager: EntityManager, @Body() body: any, @Req() request: express.Request) {
    const resetToken = await this.findResetTokenByToken(manager, body.token);
    if (resetToken && resetToken.user) {
      await this.updatePassword(resetToken.user.id, body.password, manager);
      await this.changePasswordWithTokenAudit("success", resetToken.user, request);
      await manager.getRepository(ResetToken).remove(resetToken);
      return resetToken.user;
    }
    await this.changePasswordWithTokenAudit("token not valid", resetToken.user, request);
    return Promise.reject(new HttpError(401, "Token not valid"));
  }

  @Post("/api/user/createTokenByEmail")
  @Transaction()
  public async createTokenByEmailEndpoint(@TransactionManager() manager: EntityManager, @Body() body: any, @Req() request: express.Request): Promise<void> {
    const user = await this.findUserbyEmail(body.email);
    if (user) {
      const resetToken = new ResetToken();
      resetToken.user = user;
      resetToken.token = uuid();
      resetToken.validTo = moment().add(2, "h").toDate();
      const insertResult = await manager.getRepository(ResetToken).insert(resetToken);
      await this.sendResetToken(user, resetToken.token);
      await this.sendResetTokenAudit(user, body.email, request);
    } else {
      await this.sendResetTokenAudit(user, body.email, request);
    }
    return;
  }

  private async changeMyPassword(manager: EntityManager, userId: number, currentPassword: string,
    password: string, request: express.Request): Promise<User> {
    const user = await this.findUserbyId(userId, manager);
    const userPassword = await this.getUserPassword(userId, manager);
    const ok: boolean = await bcrypt.compare(currentPassword, userPassword.password);
    if (!ok) {
      await this.changeMyPasswordAudit("password failed", user, request);
      return Promise.reject(new HttpError(401, "password not changed"));
    }
    await this.updatePassword(user.id, password, manager);
    await this.changeMyPasswordAudit("success", user, request);
    return user;
  }

  private async changePassword(currentUserId: number, userId: number, password: string, request: express.Request): Promise<User> {
    const user = await this.findUserbyId(userId, getManager());
    const currentUser = await this.findUserbyId(currentUserId, getManager());
    await this.updatePassword(user.id, password, getManager());
    await this.changePasswordAudit(currentUser, user, request);
    return user;
  }

  private async updatePassword(userId: number, unhashedPwd: string, manager: EntityManager): Promise<void> {
    await manager.getRepository(User).update({ id: userId }, { password: unhashedPwd });
    return;
  }

  private findUserbyId(userId: number, manager: EntityManager): Promise<User> {
    return manager.getRepository(User).findOne({ id: userId });
  }

  private getUserPassword(userId: number, manager: EntityManager): Promise<User> {
    return manager.getRepository(User).findOne({ id: userId }, { select: ["password"] });
  }

  private async findResetTokenByToken(manager: EntityManager, token: string): Promise<ResetToken | undefined> {
    const resetToken = await manager.getRepository(ResetToken).findOne({ token }, { relations: ["user"] });
    if (resetToken && (resetToken.validTo >= new Date())) {
      return resetToken;
    }
    return undefined;
  }

  private async findUserbyEmail(emailAddress: string): Promise<User | undefined> {
    return await getManager().getRepository(User)
      .createQueryBuilder("user")
      .addSelect("user.password")
      .leftJoinAndSelect("user.roles", "roles")
      .where("user.email = :email", { email: emailAddress })
      .getOne();
  }

  private requiresAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const valid: boolean = req.user && (req.user.roles.map((r: Role) => r.name)
      .filter((n: string) => n === "admin"));
    if (valid) {
      next();
    } else {
      res.status(403).json({ error: `not authorized to use ${req.baseUrl}` });
    }
  }

  private async checkLogin(user: User, password: string): Promise<any> {
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
    return sign({ id: user.id, roles },
      this.jwtConfig.getSignSecret(), this.jwtConfig.getSignOptions());
  }

  private async changePasswordAudit(currentUser: User, userToChange: User, request: express.Request) {
    const audit = {
      user: currentUser,
      action: "changePassword",
      actionResult: "ok",
      additionalData: userToChange.email,
    };
    await this.userAuditRepository.save(audit, { data: request });
  }


  private async changeMyPasswordAudit(actionResult: string, user: User, request: express.Request) {
    const audit = {
      user: user,
      action: "changeMyPassword",
      actionResult: actionResult,
    };
    await this.userAuditRepository.save(audit, { data: request });
  }

  private async changePasswordWithTokenAudit(actionResult: string, user: User, request: express.Request) {
    const audit = {
      user: user,
      action: "changePasswordWithToken",
      actionResult: actionResult,
    };
    await this.userAuditRepository.save(audit, { data: request });
  }

  private async sendResetTokenAudit(user: User, email: string, request: express.Request) {
    const audit = {
      user,
      action: "sendResetToken",
      actionResult: user ? "user found" : "user not found",
      additionalData: user ? undefined : email,
    };
    await this.userAuditRepository.save(audit, { data: request });
  }

  private async sendResetToken(user: User, token: string) {
    let domain = "http://localhost:4200/";
    if (this.env === "production") {
      domain = "https://usgwehlt-und-kröönt.ch";
    }
    const link = `${domain}/admin/resetPassword/${token}`;
    this.LOGGER.info(`resetLink:${link}`);
    await this.mailService.sendMail(user.email, "Pfila2024 - Passwort zurücksetzen",
      "Hallo\r\n\r\n" +
      "Du erhältst dieses Mail weil du (oder jemand anderes) für den Pfila-2024 Benutzer '" + user.email + "' eine Passwort zurücksetzen Anfrage gestellt hat.\r\n\r\n" +
      "Bitte klicke auf den folgenden Link oder kopiere ihn in deinen Browser um den Vorgang abzuschliessen.\r\n" +
      "Der Link ist zwei Stunden gültig.\r\n\r\n" + link + "\r\n\r\n" +
      "Wenn du dieses Mail irrtümlich erhalten hast, kannst du es ignorieren.\r\n\r\n" +
      "Webmaster Pfila 2024",
      "<h3>Hallo</h3>" +
      "<p>Du erhältst dieses Mail weil du (oder jemand anderes) für den Pfila-2024 Benutzer '" + user.email + "' eine Passwort zurücksetzen Anfrage gestellt hat.<br/>" +
      "Bitte klicke auf den folgenden Link oder kopiere ihn in deinen Browser um den Vorgang abzuschliessen.<br/>" +
      "Der Link ist zwei Stunden gültig.</p>" +
      "<a href='" + link + "'>" + link + "</a>" +
      "<p>Wenn Sie dieses Mail irrtümlich erhalten haben, können Sie es ignorieren.</p>" +
      "<p>Webmaster Pfila 2024</p>"
    );
  }
}

declare global {
  namespace Express {
    export interface Request {
      user?: any
    }
  }
}
