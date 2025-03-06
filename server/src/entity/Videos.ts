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

  @Column({ nullable: true })
  filename: string;

  @Column({ nullable: true })
  originalFilename: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
