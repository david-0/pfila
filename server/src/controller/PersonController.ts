import { plainToInstance } from "class-transformer";
import { Authorized, Body, CurrentUser, Delete, Get, JsonController, Param, Post, Put } from "routing-controllers";
import { EntityManager, getManager, Repository, Transaction, TransactionManager } from "typeorm";
import { Person } from "../entity/Person";

@JsonController("/api/person")
export class PersonController {
  private personRepository: (manager: EntityManager) => Repository<Person>;

  constructor() {
    this.personRepository = manager => manager.getRepository(Person);
  }

  @Transaction()
  @Authorized("admin")
  @Get("/:id([0-9]+)")
  public async get(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.personRepository(manager).findOne(id);
  }

  @Transaction()
  @Authorized("admin")
  @Get()
  public async getAll(@TransactionManager() manager: EntityManager) {
    return await this.personRepository(manager).find();
  }

  @Transaction()
  @Authorized("admin")
  @Put("/:id([0-9]+)")
  public async update(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newPersonFromBody: Person, @CurrentUser({ required: true }) userId: number) {
    const person = await this.get(manager, id);
    const newPerson = plainToInstance(Person, newPersonFromBody);
    return await this.personRepository(manager).save(this.personRepository(manager).merge(person, newPerson), { data: userId });
  }

  @Transaction()
  @Authorized("admin")
  @Delete("/:id([0-9]+)")
  public async delete(@TransactionManager() manager: EntityManager, @Param("id") id: number, @CurrentUser({ required: true }) userId: number) {
    const person = new Person();
    person.id = id;
    return await this.personRepository(manager).remove(person, { data: userId });
  }

  @Transaction()
  @Authorized(["admin", "standard"])
  @Get("/withAll/:id([0-9]+)")
  public async getWithAll(@TransactionManager() manager: EntityManager, @Param("id") id: number, @CurrentUser({ required: true }) userId: number) {
    return await this.personRepository(manager).findOne(id, { relations: ["subgroup", "subgroup.group"] });
  }

  @Transaction()
  @Authorized()
  @Get("/withAll")
  public async getAllWithAll(@TransactionManager() manager: EntityManager) {
    return await this.personRepository(manager).find({ relations: ["subgroup", "subgroup.group"] });
  }

  @Transaction()
  @Post("/withAll")
  public async saveWithAll(@TransactionManager() manager: EntityManager, @Body() person: Person) {
    return await this.personRepository(manager).insert(person);
  }

  @Transaction()
  @Authorized(["admin", "standard"])
  @Put("/withAll/:id([0-9]+)")
  public async updateWithAll(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newPersonFromBody: Person, @CurrentUser({ required: true }) userId: number) {
    const person = await this.get(manager, id);
    const newPerson = plainToInstance(Person, newPersonFromBody);
    return await this.personRepository(manager).save(this.personRepository(manager).merge(person, newPerson), { data: userId });
  }
}
