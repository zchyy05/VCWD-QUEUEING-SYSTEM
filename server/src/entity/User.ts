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
import { QueueTransaction } from "./QueueTrasaction";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  first_name: string;

  @Column()
  middle_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  phone_number: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => Division)
  @JoinColumn({ name: "division_id" })
  division: Division;

  @OneToMany(() => Department, (department) => department.user)
  departments: Department[];

  @OneToMany(() => Customer, (customer) => customer.handle_by)
  handledCustomers: Customer[];

  @OneToMany(() => QueueTransaction, (transaction) => transaction.assigned_to)
  transactions: QueueTransaction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
