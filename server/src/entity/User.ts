import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from "typeorm";

import { Division } from "./Division";
import { Department } from "./Department";
import { Customer } from "./Customer";
import { QueueTransaction } from "./QueueTransaction";
import { Terminal } from "./Terminal";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ default: "user" })
  role: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  last_activity: Date;

  @Column({ nullable: true })
  terminal_id: number;

  @ManyToOne(() => Terminal, { eager: true })
  @JoinColumn({ name: "terminal_id", referencedColumnName: "terminal_id" })
  terminal: Terminal;

  @ManyToOne(() => Division)
  @JoinColumn({ name: "division_id" })
  division: Division;

  @OneToMany(() => Customer, (customer) => customer.handle_by, {
    cascade: true,
    onDelete: "CASCADE",
  })
  handledCustomers: Customer[];

  @OneToMany(() => QueueTransaction, (transaction) => transaction.assigned_to, {
    cascade: true,
    onDelete: "CASCADE",
  })
  transactions: QueueTransaction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
