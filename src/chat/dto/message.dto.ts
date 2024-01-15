import { Message } from "../entity/message.entity";

export class MessageDto {
  readonly userId: number;
  readonly message: string;
  readonly createdAt: string;

  constructor(message: Message) {
    this.userId = message.sender.userId;
    this.message = message.content;
    this.createdAt = message.createdAt.toISOString().replace("T", " ").split(".")[0];
  }
}