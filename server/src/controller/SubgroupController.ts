import {Authorized, Delete, Get, JsonController, Post, Put} from "routing-controllers";
import {getManager, Repository} from "typeorm";
import {EntityFromBody, EntityFromParam} from "typeorm-routing-controllers-extensions";
import {Subgroup} from "../entity/Subgroup";

@Authorized("admin")
@JsonController("/api/subgroup")
export class SubgroupController {
  private subgroupRepository: Repository<Subgroup>;

  constructor() {
    this.subgroupRepository = getManager().getRepository(Subgroup);
  }

  @Get("/:id([0-9]+)")
  public get(@EntityFromParam("id") subgroup: Subgroup) {
    return subgroup;
  }

  @Get()
  public getAll() {
    return this.subgroupRepository.find();
  }

  @Put("/:id([0-9]+)")
  public update(@EntityFromParam("id") subgroup: Subgroup, @EntityFromBody() newSubgroup: Subgroup) {
    return this.subgroupRepository.save(this.subgroupRepository.merge(subgroup, newSubgroup));
  }

  @Post()
  public save(@EntityFromBody() subgroup: Subgroup) {
    return this.subgroupRepository.save(subgroup);
  }

  @Delete("/:id([0-9]+)")
  public delete(@EntityFromParam("id") subgroup: Subgroup) {
    return this.subgroupRepository.remove(subgroup);
  }
}
