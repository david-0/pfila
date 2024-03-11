import { Logger } from "log4js";
import * as moment from "moment";
import { v4 as uuid } from "uuid";
import { ResetToken } from "../entity/ResetToken";
import { User } from "../entity/User";
import { UserAudit } from "../entity/UserAudit";
import { AppMailService } from "../utils/app-mail-service";
import { AppDataSource } from "../utils/app-data-source";
import { Request, Response } from "express";
import { encrypt } from "../utils/helpers";
import { payload } from "../dto/Token";
import { AppEnv } from "../utils/app-env";
import { EntityManager } from "typeorm";
import { AppLogging } from "../utils/app-logging";

declare var process: any;

export class SecurityController {

  private static LOGGER: Logger = AppLogging.getLogger("SecurityController");

  static async login(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      try {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(500).json({ message: "email and password required" });
        }
        const user = await SecurityController.findUserbyEmail(manager, email);
        if (!user) {
          await SecurityController.authenticateAudit(manager, "not registered", user, { email, password }, req);
          return res.status(403).json({ message: "login NOT successfull" });
        }
        const isPasswordValid = encrypt.comparepassword(user.password, password);
        if (!isPasswordValid) {
          await SecurityController.authenticateAudit(manager, "password failed", user, { email, password }, req);
          return res.status(403).json({ message: "login NOT successfull" });
        }
        await SecurityController.authenticateAudit(manager, "success", user, { email, password }, req);
        const token = encrypt.generateToken({
          id: user.id,
          roles: user.roles.map(r => r.name),
          groups: []
        });
        return res.status(200).json({ message: "Login successful", user, token });
      }
      catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });
  }

  private static async findUserbyEmail(manager: EntityManager, emailAddress: string): Promise<User | undefined> {
    return await manager.getRepository(User)
      .createQueryBuilder("user")
      .addSelect("user.password")
      .leftJoinAndSelect("user.roles", "roles")
      .where("user.email = :email", { email: emailAddress })
      .getOne();
  }

  private static async findUserbyId(manager: EntityManager, id: number): Promise<User | undefined> {
    return await manager.getRepository(User)
      .createQueryBuilder("user")
      .addSelect("user.password")
      .leftJoinAndSelect("user.roles", "roles")
      .where("user.id = :id", { id })
      .getOne();
  }

  private static async authenticateAudit(manager: EntityManager, actionResult: string, user, body: any, request: Request): Promise<void> {
    const audit = {
      user,
      action: "authenticate",
      actionResult: actionResult,
      additionalData: body.email,
    };
    await manager.getRepository(UserAudit).save(audit, { data: request });
  }

  static async changePassword(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id: currentUserId }: payload = req.body;
      const { password } = req.body;
      const { id: userId } = req.params;

      const currentUser = await manager.getRepository(User).findOne({ where: { id: +currentUserId } });
      const user = await manager.getRepository(User).findOne({ where: { id: +userId } });
      await SecurityController.updatePassword(manager, +userId, password);
      await SecurityController.changePasswordAudit(manager, currentUser, user, req);
      return res.status(200).json(user);
    });
  }

  static async changeMyPassword(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const id = req["currentUser"].id;
      const { currentPassword, password } = req.body;
      const user = await SecurityController.findUserbyId(manager, id);
      const isPasswordValid = encrypt.comparepassword(user.password, currentPassword);
      if (!isPasswordValid) {
        await SecurityController.authenticateAudit(manager, "password failed", user, { email: user.email, password }, req);
        return res.status(401).json({ message: "password not changed" });
      }
      await SecurityController.updatePassword(manager, user.id, password);
      await SecurityController.changeMyPasswordAudit(manager, "success", user, req);
      return res.status(200).json(user);
    });
  }

  static async resetPasswordWithToken(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { token, password } = req.body;
      const resetToken = await SecurityController.findResetTokenByToken(manager, token);
      if (resetToken && resetToken.user) {
        await SecurityController.updatePassword(manager, resetToken.user.id, password);
        await SecurityController.changePasswordWithTokenAudit(manager, "success", resetToken.user, req);
        await manager.getRepository(ResetToken).remove(resetToken);
        return res.status(200).json(resetToken.user);
      }
      await SecurityController.changePasswordWithTokenAudit(manager, "token not valid", resetToken.user, req);
      return res.status(401).json({ message: "Token not valid" });
    });
  }

  static async createTokenByEmail(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { email } = req.body;
      const user = await manager.getRepository(User).findOne({ where: { email }, relations: ["roles"] });
      if (user) {
        const resetToken = new ResetToken();
        resetToken.user = user;
        resetToken.token = uuid();
        resetToken.validTo = moment().add(2, "h").toDate();
        await manager.getRepository(ResetToken).insert(resetToken);
        await SecurityController.sendResetToken(user, resetToken.token);
        await SecurityController.sendResetTokenAudit(manager, user, email, req);
      } else {
        await SecurityController.sendResetTokenAudit(manager, user, email, req);
      }
      return res.status(200).json({});
    });
  }

  private static async updatePassword(manager: EntityManager, userId: number, unhashedPwd: string): Promise<void> {
    await manager.getRepository(User).update({ id: userId }, { password: unhashedPwd });
  }

  private static async findResetTokenByToken(manager: EntityManager, token: string): Promise<ResetToken | undefined> {
    const resetToken = await manager.getRepository(ResetToken).findOne({ where: { token }, relations: ["user"] });
    if (resetToken && (resetToken.validTo >= new Date())) {
      return resetToken;
    }
    return undefined;
  }

  private static async changePasswordAudit(manager: EntityManager, currentUser: User, userToChange: User, request: Request) {
    const audit = {
      user: currentUser,
      action: "changePassword",
      actionResult: "ok",
      additionalData: userToChange.email,
    };
    await manager.getRepository(UserAudit).save(audit, { data: request });
  }


  private static async changeMyPasswordAudit(manager: EntityManager, actionResult: string, user: User, request: Request) {
    const audit = {
      user: user,
      action: "changeMyPassword",
      actionResult: actionResult,
    };
    await manager.getRepository(UserAudit).save(audit, { data: request });
  }

  private static async changePasswordWithTokenAudit(manager: EntityManager, actionResult: string, user: User, request: Request) {
    const audit = {
      user: user,
      action: "changePasswordWithToken",
      actionResult: actionResult,
    };
    await manager.getRepository(UserAudit).save(audit, { data: request });
  }

  private static async sendResetTokenAudit(manager: EntityManager, user: User, email: string, request: Request) {
    const audit = {
      user,
      action: "sendResetToken",
      actionResult: user ? "user found" : "user not found",
      additionalData: user ? undefined : email,
    };
    await manager.getRepository(UserAudit).save(audit, { data: request });
  }

  private static async sendResetToken(user: User, token: string) {
    const link = `${AppEnv.getUrl()}/admin/resetPassword/${token}`;
    SecurityController.LOGGER.info(`resetLink:${link}`);
    await AppMailService.sendMail(user.email, "Pfila2024 - Passwort zurücksetzen",
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