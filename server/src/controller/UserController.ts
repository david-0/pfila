import { plainToInstance } from "class-transformer";
import { User } from "../entity/User";
import { Request, Response } from "express";
import { AppDataSource } from "../utils/app-data-source";

export class UserController {
  static async get(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const user = await manager.getRepository(User).findOne({ where: { id: +id } });
      return res.status(200).json(user);
    });
  }

  static async getAll(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const users = await manager.getRepository(User).find();
      return res.status(200).json(users);
    });
  }

  static async update(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const newUser = plainToInstance(User, req.body);
      const userRepository = manager.getRepository(User);
      const loadedUser = await userRepository.findOne({ where: { id: +id } });
      const mergedUser = userRepository.merge(loadedUser, newUser);
      const updatedUser = await userRepository.save(mergedUser);
      return res.status(200).json(updatedUser);
    });
  }

  static async save(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const newUser = plainToInstance(User, req.body);
      const user = await manager.getRepository(User).save(newUser);
      return res.status(200).json(user);
    });
  }

  static async delete(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const userToDelete = new User();
      userToDelete.id = +id;
      const deletedUser = await manager.getRepository(User).remove(userToDelete);
      return res.status(200).json(deletedUser);
    });
  }

  static async getWithRoles(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const user = await manager.getRepository(User).findOne({ where: { id: +id }, relations: ["roles"] });
      return res.status(200).json(user);
    });
  }

  static async getAllWithRoles(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const users = await manager.getRepository(User).find({ relations: ["roles"] });
      return res.status(200).json(users);
    });
  }

  static async getWithRolesAndAudits(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const user = await manager.getRepository(User).findOne({ where: { id: +id }, relations: ["roles", "audits"] });
      return res.status(200).json(user);
    });
  }

  static async getAllWithRolesAndAudits(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const users = await manager.getRepository(User).find({ relations: ["roles", "audits"] });
      return res.status(200).json(users);
    });
  }
}
