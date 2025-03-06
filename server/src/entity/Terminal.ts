import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Division } from "./Division";
import { User } from "./User";

@Entity()
export class Terminal {
  @PrimaryGeneratedColumn()
  terminal_id: number;

  @Column()
  terminalNumber: number;

  @Column({ default: false })
  isOccupied: boolean;

  @Column({ nullable: true })
  occupiedById: number;

  @ManyToOne(() => User, (user) => user.terminal, { nullable: true })
  @JoinColumn({ name: "occupiedById", referencedColumnName: "user_id" })
  occupiedBy: User;

  @ManyToOne(() => Division, (division) => division.terminals)
  division: Division;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
