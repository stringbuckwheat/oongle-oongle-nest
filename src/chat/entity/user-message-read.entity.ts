import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/user.entity";
import { Message } from "./message.entity";

@Entity()
export class UserMessageRead {
  @PrimaryGeneratedColumn()
  userMessageReadId: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Message, message => message.readUsers)
  message: Message;

  @Column({ nullable: true })
  readAt: Date;
}