import { plainToInstance } from "class-transformer";
import {
  EntityManager,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent
} from "typeorm";
import { Person } from "../entity/Person";
import { Subgroup } from "../entity/Subgroup";
import { User } from "../entity/User";
import { MailService } from "../utils/MailService";

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
    const person = plainToInstance(Person, event.entity);
    const currentUser = await event.manager.getRepository(User).findOne({ where: { id: +event.queryRunner.data } });
    const userBeforeUpdate = await event.manager.getRepository(Person).findOne({
      where: { id: event.databaseEntity.id },
      relations: ["subgroup", "subgroup.group"]
    });
    await this.reloadGroup(event.manager, person);
    (await this.getUsersToNotifiy(event.manager)).forEach(u => this.notifiyPersonChanged(u, userBeforeUpdate, person, currentUser));
  }

  public async beforeRemove(event: RemoveEvent<Person>) {
    const userToDelete = await event.manager.getRepository(Person).findOne({
      where: { id: event.databaseEntity.id },
      relations: ["subgroup", "subgroup.group"]
    });
    const currentUser = await event.manager.getRepository(User).findOne({ where: { id: +event.queryRunner.data } });
    (await this.getUsersToNotifiy(event.manager)).forEach(u => this.notifiyPersonDeleted(u, userToDelete, currentUser));
  }

  public async afterInsert(event: InsertEvent<Person>) {
    await this.reloadGroup(event.manager, event.entity);
    (await this.getUsersToNotifiy(event.manager)).forEach(u => this.notifiyPersonCreated(u, event.entity));
    await this.registrationConfirmation(event.entity);
  }

  private async getUsersToNotifiy(manager: EntityManager): Promise<User[]> {
    return await manager.getRepository(User).find({ where: { notification: true } });
  }

  private async reloadGroup(manager: EntityManager, person: Person): Promise<void> {
    if (person && person.subgroup && person.subgroup.id) {
      const subgroupResult = await manager.getRepository(Subgroup).findOne({ where: { id: person.subgroup.id }, relations: ["group"] });
      if (subgroupResult && subgroupResult.group) {
        person.subgroup.group = subgroupResult.group;
      }
    }
    if (person && person.subgroup && typeof person.subgroup === "number") {
      const subgroupResult = await manager.getRepository(Subgroup).findOne({ where: { id: person.subgroup }, relations: ["group"] });
      if (subgroupResult && subgroupResult.group) {
        person.subgroup = subgroupResult;
      }
    }
  }

  private async registrationConfirmation(person: Person) {
    if (person.subgroup && person.subgroup.group && person.email) {
      let text = "Guten Tag\r\n\r\nDanke für die Anmeldung von '" + person.firstname + " " + person.lastname + "' für das Pfila 2024 " +
        "bei der Gruppe '" + person.subgroup.name + " - " + person.subgroup.group.name + "'.\r\n";
      if (person.subgroup.name === "Ameisli") {
        text += "Die Ameislis sind am Pfila am Sonntagnachmittag 19.05.2024 mit dabei.\r\n";
      } else {
        text += "Für die Jungschärler dauert das Pfila vom Samstag - Montag (18.05. - 19.05.2024).\r\n";
      }
      if (person.subgroup.group.name === "keine") {
        text += "In den nächsten Tagen werden wir mit ihnen Konkakt aufnehmen.\r\n";
      }
      text += "Weitere Infomationen sind auf unserer Homepage https://usgwehlt-und-kröönt.ch zu finden.\r\n\r\n";
      text += "Sollten sie dieses Mail irrtümlicherweise erhalten haben bitten wir sie mit uns Kontakt auf zu nehmen.\r\n\r\n";
      text += "Herzlichen Dank\r\nDas Pfila-Team";
      await this.mailService.sendMail(person.email, "Pfila2024 - Anmeldungbestätigung", text, null);
    }
  }

  private async notifiyPersonCreated(receiver: User, person: Person) {
    const text = "Hallo " + receiver.firstname + "\r\n"
      + "'" + person.firstname + " " + person.lastname + "', ein " + this.encodeFunction(person) + this.groupSubgroup(person) + " hat sich angemeldet."
      + "\r\n\r\nDetails: \r\n" + JSON.stringify(person, null, 2);
    await this.mailService.sendMail(receiver.email, "Pfila2024 - neue Anmeldung", text, null);
  }

  private async notifiyPersonDeleted(receiver: User, person: Person, currentUser: User) {
    const text = "Hallo " + receiver.firstname + "\r\n" + "Der Benutzer '" + currentUser.firstname + " " + currentUser.lastname + "' "
      + "(" + currentUser.id + ", " + currentUser.email + ") hat '" + person.firstname + " " + person.lastname + "' ein" + this.encodeFunction(person) + this.groupSubgroup(person) + " gelöscht."
      + "\r\n\r\nDetails: \r\n" + JSON.stringify(person, null, 2);
    await this.mailService.sendMail(receiver.email, "Pfila2024 - Anmeldung gelöscht", text, null);
  }

  private async notifiyPersonChanged(receiver: User, beforeChange: Person, afterChange: Person, currentUser: User) {
    const text = "Hallo " + receiver.firstname + "\r\n" + "Der Benutzer '" + currentUser.firstname + " " + currentUser.lastname + "' "
      + " (" + currentUser.id + ", " + currentUser.email + ") hat '" + afterChange.firstname + " " + afterChange.lastname + "' ein" + this.encodeFunction(afterChange) + this.groupSubgroup(afterChange) + " geändert."
      + "\r\n\r\nDetails:\r\n\r\n" + JSON.stringify(afterChange, null, 2)
      + "\r\n\r\nDetails vorher: \r\n" + JSON.stringify(beforeChange, null, 2);
    await this.mailService.sendMail(receiver.email, "Pfila2024 - Anmeldung geändert", text, null);
  }

  private encodeFunction(person: Person): string {
    return person.leader ? " Leiter" : " Teilnehmer";
  }

  private groupSubgroup(person: Person) {
    if (person && person.subgroup && person.subgroup.name && person.subgroup.group && person.subgroup.group.name) {
      return " der " + person.subgroup.name + " " + person.subgroup.group.name;
    }
    return "";
  }
}
