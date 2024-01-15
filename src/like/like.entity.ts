import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Board } from "../board/board.entity";
import { User } from "../user/user.entity";

@Entity("like")
export class Like {
  @PrimaryGeneratedColumn()
  likeId: number;

  @ManyToOne(() => Board, board => board.likes, { onDelete: 'CASCADE' })
  board: Board;

  @ManyToOne(() => User)
  user: User;
}