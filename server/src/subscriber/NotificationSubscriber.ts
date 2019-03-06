import {
  EntityManager,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent
} from "typeorm";
import {Person} from "../entity/Person";
import {Subgroup} from "../entity/Subgroup";
import {User} from "../entity/User";
import {MailService} from "../utils/MailService";

@EventSubscriber()
export class NotificationSubscriber implements EntitySubscriberInterface<Person> {

  private mailService: MailService;

  constructor() {
    this.mailService = new MailService("../../configuration/smtp.json");
  }

  public listenTo() {
    return Person;
  }

  public async beforeUpdate(event: UpdateEvent<Person>) {
    await this.reloadGroup(event.manager, event.databaseEntity.subgroup);
    await this.reloadGroup(event.manager, event.entity.subgroup);
    (await this.getUsersToNotifiy(event.manager)).forEach(u => this.notifiyPersonChanged(u, event.databaseEntity, event.entity));
  }

  public async afterRemove(event: RemoveEvent<Person>) {
    await this.reloadGroup(event.manager, event.databaseEntity.subgroup);
    (await this.getUsersToNotifiy(event.manager)).forEach(u => this.notifiyPersonDeleted(u, event.databaseEntity));
  }

  public async afterInsert(event: InsertEvent<Person>) {
    await this.reloadGroup(event.manager, event.entity.subgroup);
    (await this.getUsersToNotifiy(event.manager)).forEach(u => this.notifiyPersonCreated(u, event.entity));
  }

  private async getUsersToNotifiy(manager: EntityManager): Promise<User[]> {
    return await manager.getRepository(User).find({notification: true});
  }

  private async reloadGroup(manager: EntityManager, subgroup: Subgroup): Promise<void>{
    const subgroupResult = await manager.getRepository(Subgroup).findOne({id: subgroup.id}, {relations: ["group"]});
    if (subgroupResult && subgroupResult.group) {
      subgroup.group = subgroupResult.group;
    }
  }

  private async notifiyPersonCreated(receiver: User, person: Person) {
    const text = "Hallo " + receiver.firstname + "\r\n" + "Eine neue Anmeldung ist eingetroffen: " + person.firstname + " " + person.lastname
      + "\r\n\r\nDetails: \r\n" + JSON.stringify(person, null, 2);
    await this.mailService.sendMail(receiver.email, "Pfila2019 - neue Anmeldung", text, null);
  }

  private async notifiyPersonDeleted(receiver: User, person: Person) {
    const text = "Hallo " + receiver.firstname + "\r\n" + "Eine Anmeldung wurde gelöscht: " + person.firstname + " " + person.lastname
      + "\r\n\r\nDetails: \r\n" + JSON.stringify(person, null, 2);
    await this.mailService.sendMail(receiver.email, "Pfila2019 - neue Anmeldung", text, null);
  }

  private async notifiyPersonChanged(receiver: User, beforeChange: Person, afterChange: Person) {
    const text = "Hallo " + receiver.firstname + "\r\n" + "Eine Anmeldung wurde geändert: " + afterChange.firstname + " " + afterChange.lastname
      + "\r\n\r\nDetails:\r\n\r\n" + JSON.stringify(afterChange, null, 2)
      + "\r\n\r\nDetails vorher: \r\n" + JSON.stringify(beforeChange, null, 2);
    await this.mailService.sendMail(receiver.email, "Pfila2019 - Anmeldung geändert", text, null);
  }

  private replaceLtAndAmp(message: string): string {
    return message.replace("&", "&amp;").replace("<", "&lt;");
  }
}
