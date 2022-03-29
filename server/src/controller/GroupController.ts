import { plainToInstance } from "class-transformer";
import { Authorized, Body, Delete, Get, JsonController, Param, Post, Put } from "routing-controllers";
import { EntityManager, Repository, TransactionManager } from "typeorm";
import { Group } from "../entity/Group";


@JsonController("/api/group")
export class GroupController {
  private groupRepository: (manager: EntityManager) => Repository<Group>;

  constructor() {
    this.groupRepository = manager => manager.getRepository(Group);
  }

  @Authorized("admin")
  @Get("/:id([0-9]+)")
  public async get(@TransactionManager() manager: EntityManager, @Param("id") id: number): Promise<Group> {
    return await this.groupRepository(manager).findOne(id);
  }

  @Authorized("admin")
  @Get()
  public async getAll(@TransactionManager() manager: EntityManager): Promise<Group[]> {
    return await this.groupRepository(manager).find();
  }

  @Authorized("admin")
  @Put("/:id([0-9]+)")
  public async update(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newGroupFromBody: Group) {
    const group = await this.get(manager, id);
    const newGroup = plainToInstance(Group, newGroupFromBody);
    return await this.groupRepository(manager).save(this.groupRepository(manager).merge(group, newGroup));
  }

  @Authorized("admin")
  @Post()
  public save(@TransactionManager() manager: EntityManager, @Body() newGroupFromBody: Group) {
    const newGroup = plainToInstance(Group, newGroupFromBody);
    return this.groupRepository(manager).save(newGroup);
  }

  @Authorized("admin")
  @Delete("/:id([0-9]+)")
  public async delete(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const group = new Group();
    group.id = id;
    return await this.groupRepository(manager).remove(group);
  }

  @Authorized("admin")
  @Get("/withSubgroups/:id([0-9]+)")
  public async getWithAll(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.groupRepository(manager).findOne(id, { relations: ["subgroups"] });
  }

  @Get("/withSubgroups")
  public async getAllWithAll(@TransactionManager() manager: EntityManager): Promise<Group[]> {
    return await this.groupRepository(manager).find({ relations: ["subgroups"] });
  }

  @Authorized("admin")
  @Post("/withSubgroups")
  public saveWithSubgroups(@TransactionManager() manager: EntityManager, @Body() newGroupFromBody: Group) {
    const newGroup = plainToInstance(Group, newGroupFromBody);
    return this.groupRepository(manager).save(newGroup);
  }

  @Authorized("admin")
  @Delete("/withSubgroups/:id([0-9]+)")
  public async deleteWithSubgroups(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const group = new Group();
    group.id = id;
    return await this.groupRepository(manager).remove(group);
  }
}
