
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

  afterInit() {
  }

  handleConnection(client: any, ...args: any[]) {
  }

  handleDisconnect(client: any) {
  }

  @SubscribeMessage("join")
  handleJoin(client: any, payload: { userId: number }) {
    client.join(`user-${payload.userId}`);
    console.log(`Client ${client.id} joined room user-${payload.userId}`);
  }

  @SubscribeMessage("commentCreated")
  handleCommentCreatedEvent(payload: CommentCreatedAlarm): void {
    console.log("handleCommentCreatedEvent", payload);
    // userId에 댓글 알림
    this.server.to(`user-${payload.userId}`).emit('commentNotification', { payload });
  }
}