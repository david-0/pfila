import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Role} from "./Role";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  public id: number;

  @Unique(["email"])
  @Column()
  public email: string;

  @Column()
  public firstname: string;

  @Column()
  public lastname: string;

  @Column({select: false, nullable: true})
  public password: string;

  @ManyToMany(type => Role, role => role.users)
  @JoinTable()
  public roles: Role[];
}
