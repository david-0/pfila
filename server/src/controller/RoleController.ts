import { plainToInstance } from "class-transformer";
import { Role } from "../entity/Role";
import { Request, Response } from "express";
import { AppDataSource } from "../utils/app-data-source";

export class RoleController {

  static async get(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const role = await manager.getRepository(Role).findOne({ where: { id: +id } });
      return res.status(200).json(role);
    });
  }

  static async getAll(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const roles = await manager.getRepository(Role).find();
      return res.status(200).json(roles);
    });
  }

  static async update(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const newRole = plainToInstance(Role, req.body);
      const roleRepository = manager.getRepository(Role);
      const loadedRole = await roleRepository.findOne({ where: { id: +id } });
      const mergedRole = roleRepository.merge(loadedRole, newRole);
      const updatedRole = await roleRepository.save(mergedRole);
      return res.status(200).json(updatedRole);
    });
  }

  static async save(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const newRole = plainToInstance(Role, req.body);
      const role = await manager.getRepository(Role).save(newRole);
      return res.status(200).json(role);
    });
  }

  static async delete(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const roleToDelete = new Role();
      roleToDelete.id = +id;
      const deletedRole = await manager.getRepository(Role).remove(roleToDelete);
      return res.status(200).json(deletedRole);
    });
  }

  static async getWithUsers(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const role = await manager.getRepository(Role).findOne({ where: { id: +id }, relations: ["users"] });
      return res.status(200).json(role);
    });
  }

  static async getAllWithUsers(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const roles = await manager.getRepository(Role).find({ relations: ["users"] });
      return res.status(200).json(roles);
    });
  }
}
