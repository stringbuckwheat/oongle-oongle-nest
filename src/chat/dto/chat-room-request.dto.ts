import { Transform } from "class-transformer";

export class ChatRoomRequestDto {
  @Transform(({ value }) => parseInt(value))
  userIds: number[];

  @Transform(({ value }) => parseInt(value))
  myUserId: number;
}