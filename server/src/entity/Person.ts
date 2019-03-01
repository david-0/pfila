import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Subgroup} from "./Subgroup";

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({nullable: true})
  public createDate?: Date;
  @Column()
  public firstname: string;
  @Column()
  public lastname: string;
  @Column()
  public street: string;
  @Column({nullable: true})
  public streetNumber?: string;
  @Column()
  public plz: string;
  @Column()
  public city: string;
  @Column({nullable: true})
  public email?: string;
  @Column()
  public phoneNumber: string;
  @Column()
  public dateOfBirth: string;
  @Column({nullable: true})
  public allergies?: string;
  @Column({nullable: true})
  public comments?: string;
  @Column()
  public notification: string;
  @ManyToOne(type => Subgroup, subgroup => subgroup.persons)
  public subgroup: Subgroup;
  @Column()
  public leader: boolean;
}
