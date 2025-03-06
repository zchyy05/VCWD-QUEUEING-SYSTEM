import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Customer } from "./Customer";
import { Division } from "./Division";
import { QueueTransaction } from "./QueueTransaction";

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  queue_id: number;

  @Column({ unique: false })
  queue_number: string;

  @Column({ default: 0 })
  priority_level: number;

  @Column({ default: "Waiting" })
  status: string;

  @Column({ nullable: true })
  position: number;

  @Column({ default: 0 })
  regular_count: number;

  @Column({ default: false })
  is_skipped: boolean;

  @Column({ nullable: true })
  terminal_id: number;

  @Column({ nullable: true })
  terminal_number: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @ManyToOne(() => Division)
  @JoinColumn({ name: "division_id" })
  division: Division;

  @OneToMany(() => QueueTransaction, (transaction) => transaction.queue)
  transactions: QueueTransaction[];

  @CreateDateColumn()
  created_at: Date;
}
