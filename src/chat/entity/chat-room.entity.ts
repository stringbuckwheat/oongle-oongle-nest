import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/user.entity";
import { Message } from "./message.entity";
import { UserChatRoom } from "./user-chat-room.entity";

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  chatRoomId: number;

  @Column()
  name: string;

  @OneToMany(() => UserChatRoom,
      userChatRoom => userChatRoom.chatRoom)
  userChatRoom: UserChatRoom[];

  @OneToMany(() => Message, message => message.chatRoom)
  messages: Message[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}