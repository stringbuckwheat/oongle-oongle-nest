import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigAppModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';
import { AuthModule } from './auth/auth.module';
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';
import { AlarmModule } from './alarm/alarm.module';

@Module({
  imports: [ConfigAppModule, DatabaseModule, UserModule, BoardModule, AuthModule, LikeModule, CommentModule, AlarmModule,],
  controllers: [AppController,],
  providers: [],
})
export class AppModule {}
