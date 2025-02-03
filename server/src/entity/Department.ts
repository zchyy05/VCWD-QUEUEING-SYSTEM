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
import { User } from "./User";
import { Division } from "./Division";
@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  department_id: number;

  @Column({ unique: true })
  department_name: string;

  @OneToMany(() => Division, (division) => division.department)
  divisions: Division[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
