import { Module } from "@nestjs/common";
import { BoardController } from "./board.controller";
import { BoardService } from "./board.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Board } from "./board.entity";
import { User } from "../user/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Board]
    ),
    TypeOrmModule.forFeature(
      [User]
    )
  ],
  controllers: [BoardController],
  providers: [BoardService]
})
export class BoardModule {
}
