import * as bcrypt from "bcryptjs";
import {EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent} from "typeorm";
import {User} from "../entity/User";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  public listenTo() {
    return User;
  }

  public async beforeUpdate(event: UpdateEvent<User>) {
    if (event.entity.password) {
      event.entity.password =  await bcrypt.hash(event.entity.password, 10);
    }
  }

  public async beforeInsert(event: InsertEvent<User>) {
    if (event.entity.password) {
      event.entity.password =  await bcrypt.hash(event.entity.password, 10);
    }
  }
}
