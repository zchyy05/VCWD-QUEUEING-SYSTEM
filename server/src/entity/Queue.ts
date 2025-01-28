import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Customer } from "./Customer";
import { Division } from "./Division";
import { QueueTransaction } from "./QueueTrasaction";

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  queue_id: number;

  @Column({ unique: true })
  queue_number: string;

  @Column({ default: 0 })
  priority_level: number;

  @Column({ default: "Waiting" })
  status: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer_id: Customer;

  @ManyToOne(() => Division)
  @JoinColumn({ name: "division_id" })
  division_id: Division;

  @OneToMany(() => QueueTransaction, (transaction) => transaction.queue_id)
  transactions: QueueTransaction[];

  @CreateDateColumn()
  created_at: Date;
}
