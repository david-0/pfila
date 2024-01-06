import { plainToInstance } from "class-transformer";
import { Authorized, Body, Delete, Get, JsonController, Param, Post, Put } from "routing-controllers";
import { EntityManager, getManager, Repository, Transaction, TransactionManager } from "typeorm";
import { Role } from "../entity/Role";

@Authorized("admin")
@JsonController("/api/role")
export class RoleController {
  private roleRepository: (manager: EntityManager) => Repository<Role>;

  constructor() {
    this.roleRepository = manager => manager.getRepository(Role);
  }

  @Transaction()
  @Get("/:id([0-9]+)")
  public async get(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.roleRepository(manager).findOne(id);
  }

  @Transaction()
  @Get()
  public async  getAll(@TransactionManager() manager: EntityManager) {
    return await this.roleRepository(manager).find();
  }

  @Transaction()
  @Put("/:id([0-9]+)")
  public async update(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newRoleFromBody: Role) {
    const role = await this.roleRepository(manager).findOne(id);
    const newRole = plainToInstance(Role, newRoleFromBody);
    return await this.roleRepository(manager).save(this.roleRepository(manager).merge(role, newRole));
  }

  @Transaction()
  @Post()
  public async save(@TransactionManager() manager: EntityManager, @Body() roleFromBody: Role) {
    const role = plainToInstance(Role, roleFromBody);
    return await this.roleRepository(manager).save(role);
  }

  @Transaction()
  @Delete("/:id([0-9]+)")
  public async delete(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const role = new Role();
    role.id = id;
    return await this.roleRepository(manager).remove(role);
  }

  @Transaction()
  @Get("/withUsers/:id([0-9]+)")
  public async getWithUsers(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.roleRepository(manager).findOne(id, { relations: ["users"] });
  }

  @Transaction()
  @Get("/withUsers")
  public async getAllWithUsers(@TransactionManager() manager: EntityManager) {
    return await this.roleRepository(manager).find({ relations: ["users"] });
  }

  @Transaction()
  @Delete("/withUsers/:id([0-9]+)")
  public async deleteWithUsers(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const role = new Role();
    role.id = id;
    return await this.roleRepository(manager).remove(role);
  }
}
