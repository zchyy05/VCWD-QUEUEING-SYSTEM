import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("videos")
export class Video {
  @PrimaryGeneratedColumn()
  video_id: string;

  @Column()
  title: string;

  @Column()
  youtubeUrl: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
