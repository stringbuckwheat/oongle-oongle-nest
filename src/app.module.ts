import { Module } from "@nestjs/common";
import { MoviesModule } from "./movies/movies.module";
import { AppController } from "./app.controller";
import { ConfigAppModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [MoviesModule, ConfigAppModule, DatabaseModule, UserModule,],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
