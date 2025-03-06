import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { QueueTransaction } from "./QueueTransaction";
import { Queue } from "./Queue";

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id: number;

  @Column({ nullable: true })
  customer_name: string;

  @Column({ nullable: true })
  account_number: string;

  @Column({ default: "regular" })
  priority_type: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "handle_by" })
  handle_by: User;

  @OneToMany(() => Queue, (queue) => queue.customer)
  queues: Queue[];

  @OneToMany(() => QueueTransaction, (transaction) => transaction.customer)
  transactions: QueueTransaction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
