import { plainToInstance } from "class-transformer";
import { Group } from "../entity/Group";
import { Request, Response } from "express";
import { AppDataSource } from "../utils/app-data-source";

export class GroupController {

  static async get(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const group = await manager.getRepository(Group).findOne({ where: { id: +id } });
      return res.status(200).json(group);
    });
  }

  static async getAll(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const groups = await manager.getRepository(Group).find();
      return res.status(200).json(groups);
    });
  }

  static async update(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const newGroup = plainToInstance(Group, req.body);
      const groupRepository = manager.getRepository(Group);
      const loadedGroup = await groupRepository.findOne({ where: { id: +id } });
      const mergedGroup = groupRepository.merge(loadedGroup, newGroup);
      const updatedGroup = await groupRepository.save(mergedGroup);
      return res.status(200).json(updatedGroup);
    });
  }

  static async save(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const newGroup = plainToInstance(Group, req.body);
      const group = await manager.getRepository(Group).save(newGroup);
      return res.status(200).json(group);
    });
  }

  static async delete(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const groupToDelete = new Group();
      groupToDelete.id = +id;
      const deletedGroup = await manager.getRepository(Group).remove(groupToDelete);
      return res.status(200).json(deletedGroup);
    });
  }

  static async getWithSubgroups(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const group = await manager.getRepository(Group).findOne({ where: { id: +id }, relations: ["subgroups"] });
      return res.status(200).json(group);
    });
  }

  static async getAllWithSubgroups(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const groups = await manager.getRepository(Group).find({ relations: ["subgroups"] });
      return res.status(200).json(groups);
    });
  }
}
