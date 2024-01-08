import { plainToInstance } from "class-transformer";
import { Role } from "../entity/Role";
import { Request, Response } from "express";
import { AppDataSource } from "../app-data-source";

export class RoleController {

  static async get(req: Request, res: Response) {
    const { id } = req.params;
    const role = await AppDataSource.getRepository(Role).findOne({ where: { id: +id } });
    return res.status(200).json(role);
  }

  static async getAll(req: Request, res: Response) {
    const roles = await AppDataSource.getRepository(Role).find();
    return res.status(200).json(roles);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const newRole = plainToInstance(Role, req.body);
    const roleRepository = AppDataSource.getRepository(Role);
    const loadedRole = await roleRepository.findOne({ where: { id: +id } });
    const mergedRole = roleRepository.merge(loadedRole, newRole);
    const updatedRole = await roleRepository.save(mergedRole);
    return res.status(200).json(updatedRole);
  }

  static async save(req: Request, res: Response) {
    const newRole = plainToInstance(Role, req.body);
    const role = await AppDataSource.getRepository(Role).save(newRole);
    return res.status(200).json(role);
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const roleToDelete = new Role();
    roleToDelete.id = +id;
    const deletedRole = await AppDataSource.getRepository(Role).remove(roleToDelete);
    return res.status(200).json(deletedRole);
  }

  static async getWithUsers(req: Request, res: Response) {
    const { id } = req.params;
    const role = await AppDataSource.getRepository(Role).findOne({ where: { id: +id }, relations: ["users"] });
    return res.status(200).json(role);
  }

  static async getAllWithUsers(req: Request, res: Response) {
    const roles = await AppDataSource.getRepository(Role).find({ relations: ["users"] });
    return res.status(200).json(roles);
  }
}
