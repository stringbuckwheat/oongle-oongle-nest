import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/user.entity";
import { ChatRoom } from "./chat-room.entity";

// User - ChatRoom 관계 매핑용 테이블
@Entity()
export class UserChatRoom {
  @PrimaryGeneratedColumn()
  userChatRoomId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => ChatRoom)
  chatRoom: ChatRoom;

  @CreateDateColumn({type: "timestamp"})
  joinedAt: Date;
}