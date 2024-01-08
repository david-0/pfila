import { UserAudit } from "../entity/UserAudit";
import { AppDataSource } from "../app-data-source";
import { Request, Response } from "express";

export class UserAuditController {

  static async getAll(req: Request, res: Response) {
    const userAudits = await AppDataSource.getRepository(UserAudit).find();
    return res.status(200).json(userAudits);
  }
}
