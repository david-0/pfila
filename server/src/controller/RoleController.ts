import { plainToInstance } from "class-transformer";
import { Authorized, Body, Delete, Get, JsonController, Param, Post, Put } from "routing-controllers";
import { EntityManager, getManager, Repository, TransactionManager } from "typeorm";
import { Role } from "../entity/Role";

@Authorized("admin")
@JsonController("/api/role")
export class RoleController {
  private roleRepository: (manager: EntityManager) => Repository<Role>;

  constructor() {
    this.roleRepository = manager => manager.getRepository(Role);
  }

  @Get("/:id([0-9]+)")
  public async get(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.roleRepository(manager).findOne(id);
  }

  @Get()
  public async  getAll(@TransactionManager() manager: EntityManager) {
    return this.roleRepository(manager).find();
  }

  @Put("/:id([0-9]+)")
  public async update(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newRoleFromBody: Role) {
    const role = await this.get(manager, id);
    const newRole = plainToInstance(Role, newRoleFromBody);
    return this.roleRepository(manager).save(this.roleRepository(manager).merge(role, newRole));
  }

  @Post()
  public async save(@TransactionManager() manager: EntityManager, @Body() roleFromBody: Role) {
    const role = plainToInstance(Role, roleFromBody);
    return this.roleRepository(manager).save(role);
  }

  @Delete("/:id([0-9]+)")
  public async delete(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const role = new Role();
    role.id = id;
    return this.roleRepository(manager).remove(role);
  }

  @Get("/withUsers/:id([0-9]+)")
  public async getWithUsers(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return this.roleRepository(manager).findOne(id, { relations: ["users"] });
  }

  @Get("/withUsers")
  public async getAllWithUsers(@TransactionManager() manager: EntityManager) {
    return this.roleRepository(manager).find({ relations: ["users"] });
  }

  @Delete("/withUsers/:id([0-9]+)")
  public async deleteWithUsers(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const role = new Role();
    role.id = id;
    return this.roleRepository(manager).remove(role);
  }
}
