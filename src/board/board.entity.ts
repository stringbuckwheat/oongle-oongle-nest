import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../user/entities/user.entity";

@Entity("board")
export class Board {
  // PK, auto increment
  @PrimaryGeneratedColumn()
  boardId: number;

  // 글 제목
  @Column({length: 255, nullable: false})
  title: string;

  // 글 내용
  @Column('text') // DB 컬럼 text 타입
  content: string;

  // 비회원일 시
  @Column({length: 50, nullable: true})
  name: string;

  @Column({length: 100, nullable: true})
  password: string;

  // 회원일 시 FK
  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn() // == @CreatedDate in Spring Data JPA
  createdAt: Date;

  @UpdateDateColumn() // == @LastModifiedDate in Spring Data JPA
  updatedAt: Date; // updatedAt 컬럼 추가
}