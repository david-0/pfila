import { plainToInstance } from "class-transformer";
import { Authorized, Body, Delete, Get, JsonController, Param, Post, Put } from "routing-controllers";
import { EntityManager, Repository, Transaction, TransactionManager } from "typeorm";
import { User } from "../entity/User";

@Authorized("admin")
@JsonController("/api/user")
export class UserController {
  private userRepository: (manager: EntityManager) => Repository<User>;

  constructor() {
    this.userRepository = manager => manager.getRepository(User);
  }

  @Transaction()
  @Get("/:id([0-9]+)")
  public async get(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.userRepository(manager).findOne(id);
  }

  @Transaction()
  @Get()
  public async getAll(@TransactionManager() manager: EntityManager) {
    return await this.userRepository(manager).find();
  }

  @Transaction()
  @Post()
  public async save(@TransactionManager() manager: EntityManager, @Body() userFromBody: User) {
    const user = plainToInstance(User, userFromBody);
    return await this.userRepository(manager).save(user);
  }

  @Transaction()
  @Delete("/:id([0-9]+)")
  public async delete(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const user = new User();
    user.id = id;
    return await this.userRepository(manager).remove(user);
  }

  @Transaction()
  @Get("/withRoles/:id([0-9]+)")
  public async getWithRoles(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.userRepository(manager).findOne(id, { relations: ["roles"] });
  }

  @Transaction()
  @Get("/withRoles")
  public async getAllWithRoles(@TransactionManager() manager: EntityManager) {
    return await this.userRepository(manager).find({ relations: ["roles"] });
  }

  @Transaction()
  @Post("/withRoles")
  public async saveWithRoles(@TransactionManager() manager: EntityManager, @Body() userFromBody: User) {
    const user = plainToInstance(User, userFromBody);
    return await this.userRepository(manager).save(user);
  }

  @Transaction()
  @Put("/withRoles/:id([0-9]+)")
  public async updateWithRoles(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newUserFromBody: User) {
    const user = await this.userRepository(manager).findOne(id);
    const newUser = plainToInstance(User, newUserFromBody);
    return await this.userRepository(manager).save(this.userRepository(manager).merge(user, newUser));
  }

  @Transaction()
  @Delete("/withRoles/:id([0-9]+)")
  public async deleteWithRoles(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const user = new User();
    user.id = id;
    return await this.userRepository(manager).remove(user);
  }

  @Transaction()
  @Get("/withRolesAndAudit")
  public async getAllWithRolesAndAudits(@TransactionManager() manager: EntityManager) {
    return await this.userRepository(manager).find({ relations: ["roles", "audits"] });
  }

  @Transaction()
  @Get("/withRolesAndAudit/:id([0-9]+)")
  public async getWithRolesAndAudit(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.userRepository(manager).findOne(id, { relations: ["roles", "audits"] });
  }

  @Transaction()
  @Put("/withRolesAndAudit/:id([0-9]+)")
  public async updateWithRolesAndAudit(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newUserFromBody: User) {
    const user = await this.userRepository(manager).findOne(id);
    const newUser = plainToInstance(User, newUserFromBody);
    return await this.userRepository(manager).save(this.userRepository(manager).merge(user, newUser));
  }

  @Transaction()
  @Post("/withRolesAndAudit")
  public async saveWithRolesAndAudit(@TransactionManager() manager: EntityManager, @Body() userFromBody: User) {
    const user = plainToInstance(User, userFromBody);
    return await this.userRepository(manager).save(user);
  }

  @Transaction()
  @Delete("/withRolesAndAudit/:id([0-9]+)")
  public async deleteWithRolesWithAudit(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const user = new User();
    user.id = id;
    return await this.userRepository(manager).remove(user);
  }

}
