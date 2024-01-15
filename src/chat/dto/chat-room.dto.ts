import { MessageDto } from "./message.dto";

export class ChatRoomDto {
  readonly title: string;
  readonly chatRoomId: number;
  readonly participants: number;
  readonly messages: MessageDto[];
}