import {Authorized, CurrentUser, Delete, Get, JsonController, Param, Post, Put} from "routing-controllers";
import {getManager, Repository} from "typeorm";
import {EntityFromBody, EntityFromParam} from "typeorm-routing-controllers-extensions";
import {Person} from "../entity/Person";

@JsonController("/api/person")
export class PersonController {
  private personRepository: Repository<Person>;

  constructor() {
    this.personRepository = getManager().getRepository(Person);
  }

  @Authorized("admin")
  @Get("/:id([0-9]+)")
  public get(@EntityFromParam("id") person: Person) {
    return person;
  }

  @Authorized("admin")
  @Get()
  public getAll() {
    return this.personRepository.find();
  }

  @Authorized("admin")
  @Put("/:id([0-9]+)")
  public update(@EntityFromParam("id") person: Person, @EntityFromBody() newPerson: Person, @CurrentUser({required: true}) userId: number) {
    return this.personRepository.save(this.personRepository.merge(person, newPerson), {data: userId});
  }

  @Authorized("admin")
  @Delete("/:id([0-9]+)")
  public delete(@EntityFromParam("id") person: Person, @CurrentUser({required: true}) userId: number) {
    return this.personRepository.remove(person, {data: userId});
  }

  @Authorized(["admin", "standard"])
  @Get("/withAll/:id([0-9]+)")
  public getWithAll(@Param("id") id: number, @CurrentUser({required: true}) userId: number) {
    return this.personRepository.findOne(id, {relations: ["subgroup", "subgroup.group"]});
  }

  @Authorized()
  @Get("/withAll")
  public getAllWithAll() {
    return this.personRepository.find({relations: ["subgroup", "subgroup.group"]});
  }

  @Post("/withAll")
  public saveWithAll(@EntityFromBody() person: Person) {
    return this.personRepository.insert(person);
  }

  @Authorized(["admin", "standard"])
  @Put("/withAll/:id([0-9]+)")
  public updateWithAll(@EntityFromParam("id") person: Person, @EntityFromBody() newPerson: Person, @CurrentUser({required: true}) userId: number) {
    return this.personRepository.save(this.personRepository.merge(person, newPerson), {data: userId});
  }
}
