import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Customer } from "./Customer";
@Entity()
export class Priorities {
  @PrimaryGeneratedColumn()
  priority_id: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @Column()
  priority_num: number;
}
