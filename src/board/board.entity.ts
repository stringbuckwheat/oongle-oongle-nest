import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "../user/user.entity";
import { Like } from "../like/like.entity";
import { Comment } from "../comment/comment.entity"

@Entity("board")
export class Board {
  // PK, auto increment
  @PrimaryGeneratedColumn()
  boardId: number;

  // 글 제목
  @Column({ length: 255, nullable: false })
  title: string;

  // 글 내용
  @Column("text") // DB 컬럼 text 타입
  content: string;

  // 비회원일 시
  @Column({ length: 50, nullable: true })
  name: string;

  @Column({ length: 100, nullable: true })
  password: string;

  // 회원일 시 FK
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn() // == @CreatedDate in Spring Data JPA
  createdAt: Date;

  @UpdateDateColumn() // == @LastModifiedDate in Spring Data JPA
  updatedAt: Date; // updatedAt 컬럼 추가

  // 조회수
  @Column({ default: 0 }) // 기본값 0
  hits: number;

  // 좋아요
  @OneToMany(() => Like, like => like.board)
  likes: Like[];

  // 댓글
  @OneToMany(() => Comment, comment => comment.board)
  comments: Comment[];
}