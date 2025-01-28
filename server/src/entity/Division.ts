import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Department } from "./Department";
import { User } from "./User";
import { Queue } from "./Queue";

@Entity()
export class Division {
  @PrimaryGeneratedColumn()
  division_id: number;

  @Column()
  division_name: string;

  @Column()
  qr_code: string;

  @OneToMany(() => Department, (department) => department.division)
  departments: Department[];

  @OneToMany(() => User, (user) => user.division)
  users: User[];

  @OneToMany(() => Queue, (queue) => queue.division_id)
  queues: Queue[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
