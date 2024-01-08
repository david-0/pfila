import { plainToInstance } from "class-transformer";
import { Group } from "../entity/Group";
import { Request, Response } from "express";
import { AppDataSource } from "../app-data-source";

export class GroupController {

  static async get(req: Request, res: Response) {
    const { id } = req.params;
    const group = await AppDataSource.getRepository(Group).findOne({ where: { id: +id } });
    return res.status(200).json(group);
  }

  static async getAll(req: Request, res: Response) {
    const groups = await AppDataSource.getRepository(Group).find();
    return res.status(200).json(groups);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const newGroup = plainToInstance(Group, req.body);
    const groupRepository = AppDataSource.getRepository(Group);
    const loadedGroup = await groupRepository.findOne({ where: { id: +id } });
    const mergedGroup = groupRepository.merge(loadedGroup, newGroup);
    const updatedGroup = await groupRepository.save(mergedGroup);
    return res.status(200).json(updatedGroup);
  }

  static async save(req: Request, res: Response) {
    const newGroup = plainToInstance(Group, req.body);
    const group = await AppDataSource.getRepository(Group).save(newGroup);
    return res.status(200).json(group);
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const groupToDelete = new Group();
    groupToDelete.id = +id;
    const deletedGroup  = await AppDataSource.getRepository(Group).remove(groupToDelete);
    return res.status(200).json(deletedGroup);
  }

  static async getWithSubgroups(req: Request, res: Response) {
    const { id } = req.params;
    const group = await AppDataSource.getRepository(Group).findOne({ where: { id: +id }, relations: ["subgroups"] });
    return res.status(200).json(group);
  }

  static async getAllWithSubgroups(req: Request, res: Response) {
    const groups = await AppDataSource.getRepository(Group).find({ relations: ["subgroups"] });
    return res.status(200).json(groups);
  }
}
