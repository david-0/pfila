import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Subgroup} from "./Subgroup";

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @OneToMany(type => Subgroup, subgroup => subgroup.group, {cascade: true})
  public subgroups: Subgroup[];
}
