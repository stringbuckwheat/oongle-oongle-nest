import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/user.entity";

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  chatRoomId: number;

  @Column()
  name: string;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}