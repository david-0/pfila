import {Authorized, Get, JsonController} from "routing-controllers";
import {EntityManager, getManager, Repository, Transaction, TransactionManager} from "typeorm";
import {UserAudit} from "../entity/UserAudit";

@Authorized("admin")
@JsonController("/api/userAudit")
export class UserAuditController {

  private userAuditRepository: (manager: EntityManager) => Repository<UserAudit>;

  constructor() {
    this.userAuditRepository = manager => manager.getRepository(UserAudit);
  }

  @Transaction()
  @Get()
  public async getAll(@TransactionManager() manager: EntityManager) {
    return await this.userAuditRepository(manager).find();
  }
}
