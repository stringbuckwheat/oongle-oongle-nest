import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Board } from "../board/board.entity";
import { User } from "../user/user.entity";
import { Comment } from "../comment/comment.entity";
import { UserService } from "../user/user.service";

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Board, User, Comment]
    )
  ],
  controllers: [SearchController],
  providers: [SearchService, UserService]
})
export class SearchModule {
}
