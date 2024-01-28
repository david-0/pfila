import { plainToInstance } from "class-transformer";
import { Subgroup } from "../entity/Subgroup";
import { Request, Response } from "express";
import { AppDataSource } from "../utils/app-data-source";

export class SubgroupController {

  static async get(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const group = await manager.getRepository(Subgroup).findOne({ where: { id: +id } });
      return res.status(200).json(group);
    });
  }

  static async getAll(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const groups = await manager.getRepository(Subgroup).find();
      return res.status(200).json(groups);
    });
  }

  static async update(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const newSubgroup = plainToInstance(Subgroup, req.body);
      const groupRepository = manager.getRepository(Subgroup);
      const loadedSubgroup = await groupRepository.findOne({ where: { id: +id } });
      const mergedSubgroup = groupRepository.merge(loadedSubgroup, newSubgroup);
      const updatedSubgroup = await groupRepository.save(mergedSubgroup);
      return res.status(200).json(updatedSubgroup);
    });
  }

  static async save(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const newSubgroup = plainToInstance(Subgroup, req.body);
      const group = await manager.getRepository(Subgroup).save(newSubgroup);
      return res.status(200).json(group);
    });
  }

  static async delete(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const groupToDelete = new Subgroup();
      groupToDelete.id = +id;
      const deletedSubgroup = await manager.getRepository(Subgroup).remove(groupToDelete);
      return res.status(200).json(deletedSubgroup);
    });
  }
}
