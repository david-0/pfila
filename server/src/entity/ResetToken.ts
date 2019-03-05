import {Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {Role} from "./Role";
import {Subgroup} from "./Subgroup";
import {User} from "./User";

@Entity()
export class ResetToken {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public token: string;

  @ManyToOne(type => User, user => user.resetToken)
  public user: User;

  @Column()
  public validTo: Date;
}
