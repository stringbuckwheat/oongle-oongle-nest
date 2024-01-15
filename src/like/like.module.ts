import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Board } from "../board/board.entity";
import { User } from "../user/user.entity";
import { Like } from "./like.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Like, Board, User]
    ),
  ],
  controllers: [LikeController],
  providers: [LikeService]
})
export class LikeModule {}