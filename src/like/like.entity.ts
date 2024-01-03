import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Board } from "../board/board.entity";
import { User } from "../user/entities/user.entity";

@Entity("like")
export class Like {
  @PrimaryGeneratedColumn()
  likeId: number;

  @ManyToOne(() => Board, board => board.likes)
  board: Board;

  @ManyToOne(() => User)
  user: User;
}