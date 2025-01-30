import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Queue } from "./Queue";
import { QueueTransaction } from "./QueueTransaction";
import { User } from "./User";
import { Customer } from "./Customer";
import { Division } from "./Division";

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  history_id: number;

  @Column()
  status: string;

  @Column()
  priority_level: number;

  @Column()
  account_number: string;

  @Column()
  started_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  logged_at: Date;

  @ManyToOne(() => QueueTransaction)
  @JoinColumn({ name: "transaction_id" })
  transaction_id: QueueTransaction;

  @ManyToOne(() => Queue)
  @JoinColumn({ name: "queue_id" })
  queue: Queue;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @ManyToOne(() => Division)
  @JoinColumn({ name: "division_id" })
  division: Division;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_to" })
  assignedTo: User;
}
