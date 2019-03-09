import {Authorized, Delete, Get, JsonController, Param, Post, Put} from "routing-controllers";
import {getManager, Repository} from "typeorm";
import {EntityFromBody, EntityFromParam} from "typeorm-routing-controllers-extensions";
import {User} from "../entity/User";

@Authorized("admin")
@JsonController("/api/user")
export class UserController {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = getManager().getRepository(User);
  }

  @Get("/:id([0-9]+)")
  public get(@EntityFromParam("id") user: User) {
    return user;
  }

  @Get()
  public getAll() {
    return this.userRepository.find();
  }

  @Post()
  public save(@EntityFromBody() user: User) {
    return this.userRepository.save(user);
  }

  @Delete("/:id([0-9]+)")
  public delete(@EntityFromParam("id") user: User) {
    return this.userRepository.remove(user);
  }

  @Get("/withRoles/:id([0-9]+)")
  public getWithRoles(@Param("id") id: number) {
    return this.userRepository.findOne(id, {relations: ["roles"]});
  }

  @Get("/withRoles")
  public getAllWithRoles() {
    return this.userRepository.find({relations: ["roles"]});
  }

  @Post("/withRoles")
  public saveWithRoles(@EntityFromBody() user: User) {
    return this.userRepository.save(user);
  }

  @Put("/withRoles/:id([0-9]+)")
  public updateWithRoles(@EntityFromParam("id") user: User, @EntityFromBody() newUser: User) {
    return this.userRepository.save(this.userRepository.merge(user, newUser));
  }

  @Delete("/withRoles/:id([0-9]+)")
  public deleteWithRoles(@EntityFromParam("id") user: User) {
    return this.userRepository.remove(user);
  }

  @Get("/withRolesAndAudit/:id([0-9]+)")
  public getWithAudit(@Param("id") id: number) {
    return this.userRepository.findOne(id, {relations: ["roles", "audits"]});
  }
}
