import { plainToInstance } from "class-transformer";
import { Person } from "../entity/Person";
import { Request, Response } from "express";
import { AppDataSource } from "../utils/app-data-source";
import { payload } from "../dto/Token";

export class PersonController {

  static async get(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const person = await manager.getRepository(Person).findOne({ where: { id: +id } });
      return res.status(200).json(person);
    });
  }

  static async getAll(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const persons = await manager.getRepository(Person).find();
      return res.status(200).json(persons);
    });
  }

  static async update(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const currentUserId = req["currentUser"].id;
      const newPerson = plainToInstance(Person, req.body);
      const personRepository = manager.getRepository(Person);
      const loadedPerson = await personRepository.findOne({ where: { id: +id } });
      const mergedPerson = personRepository.merge(loadedPerson, newPerson);
      const updatedPerson = await personRepository.save(mergedPerson, { data: +currentUserId });
      return res.status(200).json(updatedPerson);
    });
  }

  static async save(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const newPerson = plainToInstance(Person, req.body);
      const person = await manager.getRepository(Person).save(newPerson);
      return res.status(200).json(person);
    });
  }

  static async delete(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const currentUserId = req["currentUser"].id;
      const personToDelete = new Person();
      personToDelete.id = +id;
      const deletedPerson = await manager.getRepository(Person).remove(personToDelete, { data: +currentUserId });
      return res.status(200).json(deletedPerson);
    });
  }

  static async getWithAll(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const { id } = req.params;
      const person = await manager.getRepository(Person).findOne({ where: { id: +id }, relations: ["subgroup", "subgroup.group"] });
      return res.status(200).json(person);
    });
  }

  static async getAllWithAll(req: Request, res: Response) {
    return await AppDataSource.transaction(async (manager) => {
      const persons = await manager.getRepository(Person).find({ relations: ["subgroup", "subgroup.group"] });
      return res.status(200).json(persons);
    });
  }
}
