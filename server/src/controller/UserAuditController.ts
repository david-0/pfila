import { UserAudit } from "../entity/UserAudit";
import { AppDataSource } from "../utils/app-data-source";
import { Request, Response } from "express";

export class UserAuditController {

  static async getAll(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const userAudits = await manager.getRepository(UserAudit).find();
      return res.status(200).json(userAudits);
    });
  }
}
