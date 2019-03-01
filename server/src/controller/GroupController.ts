import {Authorized, Delete, Get, JsonController, Param, Post, Put} from "routing-controllers";
import {getManager, Repository} from "typeorm";
import {EntityFromBody, EntityFromParam} from "typeorm-routing-controllers-extensions";
import {Group} from "../entity/Group";


@JsonController("/api/group")
export class GroupController {
  private groupRepository: Repository<Group>;

  constructor() {
    this.groupRepository = getManager().getRepository(Group);
  }

  @Authorized("admin")
  @Get("/:id([0-9]+)")
  public get(@EntityFromParam("id") group: Group) {
    return group;
  }

  @Authorized("admin")
  @Get()
  public getAll() {
    return this.groupRepository.find();
  }

  @Authorized("admin")
  @Put("/:id([0-9]+)")
  public update(@EntityFromParam("id") group: Group, @EntityFromBody() newGroup: Group) {
    return this.groupRepository.save(this.groupRepository.merge(group, newGroup));
  }

  @Authorized("admin")
  @Post()
  public save(@EntityFromBody() group: Group) {
    return this.groupRepository.save(group);
  }

  @Authorized("admin")
  @Delete("/:id([0-9]+)")
  public delete(@EntityFromParam("id") group: Group) {
    return this.groupRepository.remove(group);
  }

  @Authorized("admin")
  @Get("/withSubgroups/:id([0-9]+)")
  public getWithAll(@Param("id") id: number) {
    return this.groupRepository.findOne(id, {relations: ["subgroups"]});
  }

  @Get("/withSubgroups")
  public getAllWithAll() {
    return this.groupRepository.find({relations: ["subgroups"]});
  }

  @Authorized("admin")
  @Post("/withSubgroups")
  public saveWithSubgroups(@EntityFromBody() group: Group) {
    return this.groupRepository.save(group);
  }

  @Authorized("admin")
  @Delete("/withSubgroups/:id([0-9]+)")
  public deleteWithSubgroups(@EntityFromParam("id") group: Group) {
    return this.groupRepository.remove(group);
  }
}
