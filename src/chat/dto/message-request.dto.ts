export class MessageRequestDto {
  readonly chatRoomId: number;
  readonly senderId: number;
  readonly senderName: string;
  readonly message: string;
}