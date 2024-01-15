import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { Comment } from "./comment.entity"
import { Board } from "../board/board.entity";
import { User } from "../user/user.entity";
import { AlarmGateway } from "../alarm/alarm.gateway";

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Board, User]),
  ],
  controllers: [CommentController],
  providers: [CommentService, AlarmGateway]
})
export class CommentModule {}
