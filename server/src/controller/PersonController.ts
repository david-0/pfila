import { plainToInstance } from "class-transformer";
import { Person } from "../entity/Person";
import { Request, Response } from "express";
import { AppDataSource } from "../app-data-source";
import { payload } from "../dto/Token";

export class PersonController {

  static async get(req: Request, res: Response) {
    const { id } = req.params;
    const person = await AppDataSource.getRepository(Person).findOne({ where: { id: +id } });
    return res.status(200).json(person);
  }

  static async getAll(req: Request, res: Response) {
    const persons = await AppDataSource.getRepository(Person).find();
    return res.status(200).json(persons);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { id: currentUserId }: payload = req.body;
    console.error("id: " + id + ", +id:" + +id);
    const newPerson = plainToInstance(Person, req.body);
    const personRepository = AppDataSource.getRepository(Person);
    const loadedPerson = await personRepository.findOne({ where: { id: +id } });
    console.error("loadedPerson: " + JSON.stringify(loadedPerson));
    const mergedPerson = personRepository.merge(loadedPerson, newPerson);
    console.error("mergedPerson: " + JSON.stringify(mergedPerson) + ", currentUserId=" + currentUserId);
    const updatedPerson = await personRepository.save(mergedPerson, { data: currentUserId });
    console.error("updatedPerson: " + JSON.stringify(updatedPerson));
    return res.status(200).json(updatedPerson);
  }

  static async save(req: Request, res: Response) {
    const newPerson = plainToInstance(Person, req.body);
    const person = await AppDataSource.getRepository(Person).save(newPerson);
    return res.status(200).json(person);
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const personToDelete = new Person();
    personToDelete.id = +id;
    const deletedPerson = await AppDataSource.getRepository(Person).remove(personToDelete);
    return res.status(200).json(deletedPerson);
  }

  static async getWithAll(req: Request, res: Response) {
    const { id } = req.params;
    const person = await AppDataSource.getRepository(Person).findOne({ where: { id: +id }, relations: ["subgroup", "subgroup.group"] });
    return res.status(200).json(person);
  }

  static async getAllWithAll(req: Request, res: Response) {
    const persons = await AppDataSource.getRepository(Person).find({ relations: ["subgroup", "subgroup.group"] });
    return res.status(200).json(persons);
  }
}
