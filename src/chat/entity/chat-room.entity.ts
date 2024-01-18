import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/user.entity";
import { Message } from "./message.entity";

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  chatRoomId: number;

  @Column()
  name: string;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, message => message.chatRoom)
  messages: Message[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}