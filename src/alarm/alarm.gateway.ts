
import { Socket } from "socket.io";
import {
  OnGatewayConnection,
  OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { CommentCreatedAlarm } from "./dto/commentCreatedAlarm.dto";

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000']
  }
})
export class AlarmGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // Nest.js에서 WebSockets을 사용할 때, WebSocketGateway 클래스가 필요로 하는 인터페이스들
  // 이 인터페이스를 구현하지 않으면 WebSocketGateway가 올바르게 작동 X
  @WebSocketServer() server: Socket;
  private alarmClients = [];

  afterInit() {
  }

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(`Alarm Client connected: ${client.id}`);
    this.alarmClients.push(client.id);
    console.log("alarmClients: ", this.alarmClients.length);
  }

  handleDisconnect(client: Socket) {
    console.log(`Alarm Client disconnect: ${client.id}`);
    this.alarmClients = this.alarmClients.filter((id) => id !== client.id);
    console.log("alarmClients: ", this.alarmClients.length);
    client.disconnect();
  }

  @SubscribeMessage("join")
  handleJoin(client: Socket, payload: { userId: number }) {
    client.join(`user-${payload.userId}`);
  }

  @SubscribeMessage("commentCreated")
  handleCommentCreatedEvent(payload: CommentCreatedAlarm): void {
    console.log("handleCommentCreatedEvent", payload);
    // userId에 댓글 알림
    this.server.to(`user-${payload.userId}`).emit('commentNotification', { payload });
  }
}