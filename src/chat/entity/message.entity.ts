import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/user.entity";
import { ChatRoom } from "./chat-room.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  messageId: number;

  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => ChatRoom)
  chatRoom: ChatRoom;

  @Column()
  content: string;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;
}