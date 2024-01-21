import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthGuard } from "@nestjs/passport";
import AuthUser from "../auth/user.decorator";
import { ChatRoom } from "./entity/chat-room.entity";
import { ChatRoomDto } from "./dto/chat-room.dto";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {
  }

  /**
   * 해당 유저의 전체 채팅방 정보
   * @param user
   */
  @Get()
  @UseGuards(AuthGuard("jwt"))
  getAllByUserId(@AuthUser() user): Promise<ChatRoom[]> {
    return this.chatService.getAllByUserId(user);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  createGroupChat(@Body() userIds: number[], @AuthUser() user): Promise<ChatRoomDto> {
    return this.chatService.getRoomByUserIds([...userIds, user.userId]);
  }
}
