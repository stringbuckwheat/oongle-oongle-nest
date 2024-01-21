import { MessageResponseDto } from "./message-response.dto";
import { ChatRoom } from "../entity/chat-room.entity";

export class ChatRoomDto {
  readonly title: string;
  readonly chatRoomId: number;
  readonly participants: number;
  readonly messages: MessageResponseDto[];

  constructor(chatRoom: ChatRoom) {
    this.chatRoomId = chatRoom.chatRoomId;
    this.title = chatRoom.name;
    this.participants = chatRoom.participants?.length;
    this.messages = chatRoom.messages?.map((message) => new MessageResponseDto(message, chatRoom.chatRoomId))
  }
}