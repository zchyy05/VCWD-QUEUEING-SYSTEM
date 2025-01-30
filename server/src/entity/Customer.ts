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
import { User } from "./User";
import { QueueTransaction } from "./QueueTransaction";
import { Queue } from "./Queue";
@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id: number;

  @Column()
  customer_name: string;

  @Column()
  phone_number: string;

  @Column()
  priority_type: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "handle_by" })
  handle_by: User;

  @OneToMany(() => Queue, (queue) => queue.customer_id)
  queues: Queue[];

  @OneToMany(() => QueueTransaction, (transaction) => transaction.customer_id)
  transactions: QueueTransaction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
