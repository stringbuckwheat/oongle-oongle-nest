import { CommentCreatedAlarm } from "../../alarm/dto/commentCreatedAlarm.dto";

export class AuthUser {
  readonly accessToken: string;
  readonly userId: number;
  readonly name: string;
  readonly alarms: CommentCreatedAlarm[];
}