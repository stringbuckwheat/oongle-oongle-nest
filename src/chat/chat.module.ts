import { Module } from '@nestjs/common';
import { ChatGateway } from "./chat.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./entity/message.entity";
import { ChatRoom } from "./entity/chat-room.entity";
import { UserChatRoom } from "./entity/user-chat-room.entity";
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { User } from "../user/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, Message, UserChatRoom, User])],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController]
})

export class ChatModule {}
