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
    const currentUser = await event.manager.getRepository(User).findOne(event.queryRunner.data);
    const userBeforeUpdate = await event.manager.getRepository(Person).findOne(event.databaseEntity.id, {relations: ["subgroup", "subgroup.group"]});
    await this.reloadGroup(event.manager, event.entity);
    (await this.getUsersToNotifiy(event.manager)).forEach(u => this.notifiyPersonChanged(u, userBeforeUpdate, event.entity, currentUser));
  }

  public async beforeRemove(event: RemoveEvent<Person>) {
    const userToDelete = await event.manager.getRepository(Person).findOne(event.databaseEntity.id, {relations: ["subgroup", "subgroup.group"]});
    const currentUser = await event.manager.getRepository(User).findOne(event.queryRunner.data);
    (await this.getUsersToNotifiy(event.manager)).forEach(u => this.notifiyPersonDeleted(u, userToDelete, currentUser));
  }

  public async afterInsert(event: InsertEvent<Person>) {
    await this.reloadGroup(event.manager, event.entity);
    (await this.getUsersToNotifiy(event.manager)).forEach(u => this.notifiyPersonCreated(u, event.entity));
  }

  private async getUsersToNotifiy(manager: EntityManager): Promise<User[]> {
    return await manager.getRepository(User).find({notification: true});
  }

  private async reloadGroup(manager: EntityManager, person: Person): Promise<void> {
    if (person && person.subgroup && person.subgroup.id) {
      const subgroupResult = await manager.getRepository(Subgroup).findOne({id: person.subgroup.id}, {relations: ["group"]});
      if (subgroupResult && subgroupResult.group) {
        person.subgroup.group = subgroupResult.group;
      }
    }
    if (person && person.subgroup && typeof person.subgroup === "number") {
      const subgroupResult = await manager.getRepository(Subgroup).findOne({id: person.subgroup}, {relations: ["group"]});
      if (subgroupResult && subgroupResult.group) {
        person.subgroup = subgroupResult;
      }
    }
  }

  private async notifiyPersonCreated(receiver: User, person: Person) {
    const text = "Hallo " + receiver.firstname + "\r\n"
      + "'" + person.firstname + " " + person.lastname + "', ein " + this.encodeFunction(person) + this.groupSubgroup(person) + " hat sich angemeldet."
      + "\r\n\r\nDetails: \r\n" + JSON.stringify(person, null, 2);
    await this.mailService.sendMail(receiver.email, "Pfila2019 - neue Anmeldung", text, null);
  }

  private async notifiyPersonDeleted(receiver: User, person: Person, currentUser: User) {
    const text = "Hallo " + receiver.firstname + "\r\n" + "Der Benutzer '" + currentUser.firstname + " " + currentUser.lastname + "' "
      + "(" + currentUser.id + ", " + currentUser.email + ") hat '" + person.firstname + " " + person.lastname + "' ein" + this.encodeFunction(person) + this.groupSubgroup(person) + " gelöscht."
      + "\r\n\r\nDetails: \r\n" + JSON.stringify(person, null, 2);
    await this.mailService.sendMail(receiver.email, "Pfila2019 - Anmeldung gelöscht", text, null);
  }

  private async notifiyPersonChanged(receiver: User, beforeChange: Person, afterChange: Person, currentUser: User) {
    const text = "Hallo " + receiver.firstname + "\r\n" + "Der Benutzer '" + currentUser.firstname + " " + currentUser.lastname + "' "
      + " (" + currentUser.id + ", " + currentUser.email + ") hat '" + afterChange.firstname + " " + afterChange.lastname + "' ein" + this.encodeFunction(afterChange) + this.groupSubgroup(afterChange) + " geändert."
      + "\r\n\r\nDetails:\r\n\r\n" + JSON.stringify(afterChange, null, 2)
      + "\r\n\r\nDetails vorher: \r\n" + JSON.stringify(beforeChange, null, 2);
    await this.mailService.sendMail(receiver.email, "Pfila2019 - Anmeldung geändert", text, null);
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
