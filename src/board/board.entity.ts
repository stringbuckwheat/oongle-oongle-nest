import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  // ID
  @Column({length: 50, nullable: false})
  username: string;

  @Column({length: 100, nullable: false})
  password: string;

  @CreateDateColumn()
  createdAt: Date;
}