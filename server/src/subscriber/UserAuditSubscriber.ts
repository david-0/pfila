import {EntitySubscriberInterface, EventSubscriber, InsertEvent} from "typeorm";
import {UserAudit} from "../entity/UserAudit";

@EventSubscriber()
export class UserAuditSubscriber implements EntitySubscriberInterface<UserAudit> {
  public listenTo() {
    return UserAudit;
  }

  public async beforeInsert(event: InsertEvent<UserAudit>) {
    const ips: string[] = [event.queryRunner.data.ip];
    ips.push(...event.queryRunner.data.ips);
    event.entity.date = new Date();
    event.entity.ip =  ips.join(", ") ;
    event.entity.userAgent =  event.queryRunner.data.headers["user-agent"];
  }
}
