import { Message } from "../entity/message.entity";

export class MessageResponseDto {
  readonly chatRoomId: number;
  readonly senderId: number;
  readonly senderName: string;

  readonly message: string;
  readonly createdAt: string;

  constructor(message: Message, chatRoomId: number) {
    this.chatRoomId = chatRoomId;
    this.senderId = message.sender.userId;
    this.senderName = message.sender.name;
    this.message = message.content;
    this.createdAt = message.createdAt.toISOString().replace("T", " ").split(".")[0];
  }
}