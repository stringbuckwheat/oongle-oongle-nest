import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigAppModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';

@Module({
  imports: [ConfigAppModule, DatabaseModule, UserModule, BoardModule,],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
