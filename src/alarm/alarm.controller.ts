import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AlarmService } from "./alarm.service";

@Controller('alarm')
export class AlarmController {

  constructor(private readonly alarmService: AlarmService) {
  }

  @Get("/user/:id/alarm/comment")
  @UseGuards(AuthGuard("jwt"))
  async getCommentAlarm(@Param("id") userId): Promise<any> {
    return this.alarmService.getCommentAlarm(userId);
  }

  @Get("/user/:id/alarm/chat")
  @UseGuards(AuthGuard("jwt"))
  async getChatAlarm(@Param("id") userId): Promise<any> {
    return this.alarmService.getUnReadMessage(userId);
  }
}
