import {Authorized, Get, JsonController} from "routing-controllers";
import {getManager, Repository} from "typeorm";
import {UserAudit} from "../entity/UserAudit";

@Authorized("admin")
@JsonController("/api/userAudit")
export class UserAuditController {
  private userAuditRepository: Repository<UserAudit>;

  constructor() {
    this.userAuditRepository = getManager().getRepository(UserAudit);
  }

  @Get()
  public getAll() {
    return this.userAuditRepository.find();
  }
}
