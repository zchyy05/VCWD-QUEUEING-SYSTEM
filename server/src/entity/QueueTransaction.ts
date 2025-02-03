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
import { Queue } from "./Queue";
import { Customer } from "./Customer";
import { User } from "./User";
import { History } from "./History";

@Entity()
export class QueueTransaction {
  @PrimaryGeneratedColumn()
  transaction_id: number;

  @Column()
  status: string;

  @Column()
  account_number: string;

  @Column()
  started_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @ManyToOne(() => Queue)
  @JoinColumn({ name: "queue_id" })
  queue: Queue; // Changed from queue_id

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer: Customer; // Changed from customer_id

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_to" })
  assigned_to: User;

  @OneToMany(() => History, (history) => history.transaction)
  histories: History[];
}
