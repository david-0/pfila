import { getLogger, Logger } from "log4js";
import * as moment from "moment";
import { v4 as uuid } from "uuid";
import { ResetToken } from "../entity/ResetToken";
import { User } from "../entity/User";
import { UserAudit } from "../entity/UserAudit";
import { AppMailService } from "../app-mail-service";
import { AppDataSource } from "../app-data-source";
import { Request, Response } from "express";
import { encrypt } from "../utils/helpers";
import { payload } from "../dto/Token";
import { AppEnv } from "../app-env";

declare var process: any;

export class SecurityController {

  private static LOGGER: Logger = getLogger("SecurityController");

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(500).json({ message: "email and password required" });
      }
      const userRepository = AppDataSource.getRepository(User);
      const user = await SecurityController.findUserbyEmail(email)
      if (!user) {
        await SecurityController.authenticateAudit("not registered", user, { email, password }, req);
        return res.status(404).json({ message: "login NOT successfull" });
      }
      const isPasswordValid = encrypt.comparepassword(user.password, password);
      if (!isPasswordValid) {
        await SecurityController.authenticateAudit("password failed", user, { email, password }, req);
        return res.status(404).json({ message: "login NOT successfull" });
      }
      await SecurityController.authenticateAudit("success", user, { email, password }, req);
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
  }

  private static async findUserbyEmail(emailAddress: string): Promise<User | undefined> {
    return await AppDataSource.getRepository(User)
      .createQueryBuilder("user")
      .addSelect("user.password")
      .leftJoinAndSelect("user.roles", "roles")
      .where("user.email = :email", { email: emailAddress })
      .getOne();
  }


  private static async authenticateAudit(actionResult: string, user, body: any, request: Request): Promise<void> {
    const audit = {
      user,
      action: "authenticate",
      actionResult: actionResult,
      additionalData: body.email,
    };
    await AppDataSource.getRepository(UserAudit).save(audit, { data: request });
  }

  static async changePassword(req: Request, res: Response) {
    const { id: currentUserId }: payload = req.body;
    const { password } = req.body;
    const { id: userId } = req.params;

    const currentUser = await AppDataSource.getRepository(User).findOne({ where: { id: +currentUserId } });
    const user = await AppDataSource.getRepository(User).findOne({ where: { id: +userId } });
    await this.updatePassword(+userId, password);
    await this.changePasswordAudit(currentUser, user, req);
    return user;
  }

  static async changeMyPassword(req: Request, res: Response) {
    const { id }: payload = req.body;
    const { email, password } = req.body;
    const user = await AppDataSource.getRepository(User).findOne({ where: { id } });
    const isPasswordValid = encrypt.comparepassword(user.password, password);
    if (!isPasswordValid) {
      await SecurityController.authenticateAudit("password failed", user, { email, password }, req);
      return res.status(401).json({ message: "password not changed" });
    }
    await this.updatePassword(user.id, password);
    await this.changeMyPasswordAudit("success", user, req);
    return user;
  }

  static async resetPasswordWithToken(req: Request, res: Response) {
    const { token, password } = req.body;
    const resetToken = await this.findResetTokenByToken(token);
    if (resetToken && resetToken.user) {
      await this.updatePassword(resetToken.user.id, password);
      await this.changePasswordWithTokenAudit("success", resetToken.user, req);
      await AppDataSource.getRepository(ResetToken).remove(resetToken);
      return resetToken.user;
    }
    await this.changePasswordWithTokenAudit("token not valid", resetToken.user, req);
    return res.status(401).json({ message: "Token not valid" });
  }

  static async createTokenByEmail(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const user = await AppDataSource.getRepository(User).findOne({ where: { email }, relations: ["roles"] });
    if (user) {
      const resetToken = new ResetToken();
      resetToken.user = user;
      resetToken.token = uuid();
      resetToken.validTo = moment().add(2, "h").toDate();
      await AppDataSource.getRepository(ResetToken).insert(resetToken);
      await this.sendResetToken(user, resetToken.token);
      await this.sendResetTokenAudit(user, email, req);
    } else {
      await this.sendResetTokenAudit(user, email, req);
    }
  }

  private static async updatePassword(userId: number, unhashedPwd: string): Promise<void> {
    await AppDataSource.getRepository(User).update({ id: userId }, { password: unhashedPwd });
  }

  private static async findResetTokenByToken(token: string): Promise<ResetToken | undefined> {
    const resetToken = await AppDataSource.getRepository(ResetToken).findOne({ where: { token }, relations: ["user"] });
    if (resetToken && (resetToken.validTo >= new Date())) {
      return resetToken;
    }
    return undefined;
  }

  private static async changePasswordAudit(currentUser: User, userToChange: User, request: Request) {
    const audit = {
      user: currentUser,
      action: "changePassword",
      actionResult: "ok",
      additionalData: userToChange.email,
    };
    await AppDataSource.getRepository(UserAudit).save(audit, { data: request });
  }


  private static async changeMyPasswordAudit(actionResult: string, user: User, request: Request) {
    const audit = {
      user: user,
      action: "changeMyPassword",
      actionResult: actionResult,
    };
    await AppDataSource.getRepository(UserAudit).save(audit, { data: request });
  }

  private static async changePasswordWithTokenAudit(actionResult: string, user: User, request: Request) {
    const audit = {
      user: user,
      action: "changePasswordWithToken",
      actionResult: actionResult,
    };
    await AppDataSource.getRepository(UserAudit).save(audit, { data: request });
  }

  private static async sendResetTokenAudit(user: User, email: string, request: Request) {
    const audit = {
      user,
      action: "sendResetToken",
      actionResult: user ? "user found" : "user not found",
      additionalData: user ? undefined : email,
    };
    await AppDataSource.getRepository(UserAudit).save(audit, { data: request });
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

declare global {
  namespace Express {
    export interface Request {
      user?: any
    }
  }
}
