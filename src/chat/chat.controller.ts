import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthGuard } from "@nestjs/passport";
import AuthUser from "../auth/user.decorator";
import { ChatRoom } from "./entity/chat-room.entity";
import { ChatRoomDto } from "./dto/chat-room.dto";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {
  }

  @Get()
  @UseGuards(AuthGuard("jwt"))
  getAllByUserId(@AuthUser() user): Promise<ChatRoom[]> {
    return this.chatService.getAllByUserId(user);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  createOrFindChatRoomByUserId(@Body() userIds: number[], @AuthUser() user): Promise<ChatRoomDto> {
    return this.chatService.createOrFindChatRoomByUserIds([...userIds, user.userId]);
  }

  @Put("message/:messageId")
  @UseGuards(AuthGuard("jwt"))
  markedMessageAsRead(@Param("messageId") messageId: number, @AuthUser() authUser): Promise<{messageId: number}> {
    return this.chatService.markedMessageAsRead(messageId, authUser.userId);
  }
}
