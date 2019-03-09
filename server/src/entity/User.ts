import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique} from "typeorm";
import {ResetToken} from "./ResetToken";
import {Role} from "./Role";
import {UserAudit} from "./UserAudit";

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

  @Column({default: false})
  public notification: boolean;

  @ManyToMany(type => Role, role => role.users)
  @JoinTable()
  public roles: Role[];

  @OneToMany(type => ResetToken, resetToken => resetToken.token, {cascade: true})
  public resetToken?: ResetToken[];

  @OneToMany(type => UserAudit, userAudit => userAudit.user, {cascade: true})
  public audit?: UserAudit[];
}
