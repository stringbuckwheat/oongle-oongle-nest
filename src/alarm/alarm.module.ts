import { Module } from '@nestjs/common';
import { AlarmGateway } from "./alarm.gateway";
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserMessageRead } from "../chat/entity/user-message-read.entity";
import {Comment} from "../comment/comment.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Comment, UserMessageRead]
    ),
  ],
  providers: [AlarmGateway, AlarmService],
  exports: [AlarmService],
  controllers: [AlarmController]
})
export class AlarmModule {}
