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
import { Terminal } from "./Terminal";
import { Department } from "./Department";
import { User } from "./User";
import { Queue } from "./Queue";

@Entity()
export class Division {
  @PrimaryGeneratedColumn()
  division_id: number;

  @Column()
  division_name: string;

  @Column({ length: 5, default: "" })
  queue_prefix: string;

  @Column({ nullable: true })
  qr_code: string;

  @ManyToOne(() => Department, (department) => department.divisions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "department_id" })
  department: Department;

  @OneToMany(() => User, (user) => user.division)
  users: User[];

  @OneToMany(() => Queue, (queue) => queue.division)
  queues: Queue[];

  @OneToMany(() => Terminal, (terminal) => terminal.division)
  terminals: Terminal[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
