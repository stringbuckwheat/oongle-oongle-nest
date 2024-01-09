import { Module } from '@nestjs/common';
import { AlarmGateway } from "./alarm.gateway";

@Module({
  providers: [AlarmGateway]
})
export class AlarmModule {}
