import { plainToInstance } from "class-transformer";
import {Authorized, Body, Delete, Get, JsonController, Param, Post, Put} from "routing-controllers";
import {EntityManager, getManager, Repository, Transaction, TransactionManager} from "typeorm";
import {Subgroup} from "../entity/Subgroup";

@Authorized("admin")
@JsonController("/api/subgroup")
export class SubgroupController {

  private subgroupRepository: (manager: EntityManager) => Repository<Subgroup>;

  constructor() {
    this.subgroupRepository = manager => manager.getRepository(Subgroup);
  }

  @Transaction()
  @Get("/:id([0-9]+)")
  public async get(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.subgroupRepository(manager).findOne(id);
  }

  @Transaction()
  @Get()
  public async getAll(@TransactionManager() manager: EntityManager) {
    return await this.subgroupRepository(manager).find();
  }

  @Transaction()
  @Put("/:id([0-9]+)")
  public async update(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newSubgroupFromBody: Subgroup) {
    const subgroup = await this.get(manager, id);
    const newSubgroup = plainToInstance(Subgroup, newSubgroupFromBody);
    return await this.subgroupRepository(manager).save(this.subgroupRepository(manager).merge(subgroup, newSubgroup));
  }

  @Transaction()
  @Post()
  public async save(@TransactionManager() manager: EntityManager, @Body() subgroup: Subgroup) {
    return await this.subgroupRepository(manager).save(subgroup);
  }

  @Transaction()
  @Delete("/:id([0-9]+)")
  public async delete(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const subgroup = new Subgroup();
    subgroup.id = id;
    return await this.subgroupRepository(manager).remove(subgroup);
  }
}
