import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Group} from "./Group";
import {Person} from "./Person";

@Entity()
export class Subgroup {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  public name: string;
  @OneToMany(type => Person, person => person.subgroup, {cascade: true})
  public persons?: Person[];
  @ManyToOne(type => Group, group => group.subgroups)
  public group: Group;
}
