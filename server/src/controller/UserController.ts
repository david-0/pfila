import { plainToInstance } from "class-transformer";
import {Authorized, Body, Delete, Get, JsonController, Param, Post, Put} from "routing-controllers";
import {EntityManager, getManager, Repository, TransactionManager} from "typeorm";
import {User} from "../entity/User";

@Authorized("admin")
@JsonController("/api/user")
export class UserController {
  private userRepository: (manager: EntityManager) => Repository<User>;

  constructor() {
    this.userRepository = manager => manager.getRepository(User);
  }

  @Get("/:id([0-9]+)")
  public async  get(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.userRepository(manager).findOne(id);
  }

  @Get()
  public async  getAll(@TransactionManager() manager: EntityManager) {
    return await this.userRepository(manager).find();
  }

  @Post()
  public async  save(@TransactionManager() manager: EntityManager, @Body() userFromBody: User) {
    const user = plainToInstance(User, userFromBody);
    return await this.userRepository(manager).save(user);
  }

  @Delete("/:id([0-9]+)")
  public async  delete(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    const user = new User();
    user.id = id;
    return await this.userRepository(manager).remove(user);
  }

  @Get("/withRoles/:id([0-9]+)")
  public async  getWithRoles(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.userRepository(manager).findOne(id, {relations: ["roles"]});
  }

  @Get("/withRoles")
  public async  getAllWithRoles(@TransactionManager() manager: EntityManager) {
    return await this.userRepository(manager).find({relations: ["roles"]});
  }

  @Post("/withRoles")
  public async  saveWithRoles(@TransactionManager() manager: EntityManager, @Body() userFromBody: User) {
    const user = plainToInstance(User, userFromBody);
    return await this.userRepository(manager).save(user);
  }

  @Put("/withRoles/:id([0-9]+)")
  public async updateWithRoles(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newUserFromBody: User) {
    const user = await this.get(manager, id);
    const newUser = plainToInstance(User, newUserFromBody);
    return await this.userRepository(manager).save(this.userRepository(manager).merge(user, newUser));
  }

  @Delete("/withRoles/:id([0-9]+)")
  public async deleteWithRoles(@TransactionManager() manager: EntityManager, @Param("id") user: User) {
    return await this.userRepository(manager).remove(user);
  }

  @Get("/withRolesAndAudit")
  public async  getAllWithRolesAndAudits(@TransactionManager() manager: EntityManager) {
    return await this.userRepository(manager).find({relations: ["roles", "audits"]});
  }

  @Get("/withRolesAndAudit/:id([0-9]+)")
  public async  getWithRolesAndAudit(@TransactionManager() manager: EntityManager, @Param("id") id: number) {
    return await this.userRepository(manager).findOne(id, {relations: ["roles", "audits"]});
  }

  @Put("/withRolesAndAudit/:id([0-9]+)")
  public async  updateWithRolesAndAudit(@TransactionManager() manager: EntityManager, @Param("id") id: number, @Body() newUserFromBody: User) {
    const user = await this.get(manager, id);
    const newUser = plainToInstance(User, newUserFromBody);
    return await this.userRepository(manager).save(this.userRepository(manager).merge(user, newUser));
  }
}
