import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "../user/user.entity";
import { Board } from "../board/board.entity";
import { Like } from "../like/like.entity";
import { Comment } from "../comment/comment.entity";
import { ChatRoom } from "../chat/entity/chat-room.entity";
import { UserChatRoom } from "../chat/entity/user-chat-room.entity";
import { Message } from "../chat/entity/message.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: "mariadb",
        host: configService.get("DB_HOST"),
        port: +configService.get<number>("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        entities: [User, Board, Like, Comment, ChatRoom, UserChatRoom, Message],
        synchronize: true, // 개발 환경에서만 사용 (애플리케이션이 시작될 때 데이터베이스 테이블을 생성 또는 업데이트),
        logging: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
