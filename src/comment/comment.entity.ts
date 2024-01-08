import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, JoinColumn,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Board } from "../board/board.entity";
import { User } from "../user/entities/user.entity";

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  commentId: number;

  @Column({type: 'text'})
  content: string;

  @ManyToOne(() => Board, {onDelete: "CASCADE"})
  @JoinColumn({name: "BoardId"})
  board: Board;

  @ManyToOne(() => User, {onDelete: "CASCADE"})
  @JoinColumn({name: "userId"})
  user: User;

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
  password: string;

  @ManyToOne(() => Comment, {onDelete: "CASCADE"})
  @JoinColumn({name: "parentCommentId"})
  parentComment: Comment;

  @OneToMany(() => Comment, comment => comment.parentComment)
  replies: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 논리 삭제
  @DeleteDateColumn()
  deletedAt: Date;
}