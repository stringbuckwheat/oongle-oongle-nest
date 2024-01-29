import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/user.entity";
import { ChatRoom } from "./chat-room.entity";
import { UserMessageRead } from "./user-message-read.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  messageId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  sender: User;

  @ManyToOne(() => ChatRoom)
  chatRoom: ChatRoom;

  @Column()
  content: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  // 읽음 여부
  @OneToMany(() => UserMessageRead, (userMessageRead) => userMessageRead.message)
  readUsers: UserMessageRead[];
}