import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./entity/message.entity";
import { ChatRoom } from "./entity/chat-room.entity";
import { UserChatRoom } from "./entity/user-chat-room.entity";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { User } from "../user/user.entity";
import { UserMessageRead } from "./entity/user-message-read.entity";
import { AlarmGateway } from "../alarm/alarm.gateway";

@Module({
  imports: [TypeOrmModule.forFeature([
    ChatRoom, Message, UserChatRoom, User, UserMessageRead
  ])],
  providers: [ChatGateway, ChatService, AlarmGateway],
  controllers: [ChatController]
})

export class ChatModule {}
