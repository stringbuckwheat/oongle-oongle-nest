import { Socket } from "socket.io";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { CommentCreatedAlarm } from "./dto/commentCreatedAlarm.dto";
import { Message } from "../chat/entity/message.entity";
import { User } from "../user/user.entity";

@WebSocketGateway({
  namespace: "alarm",
  cors: {
    origin: ["http://localhost:3000"]
  }
})
export class AlarmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // Nest.js에서 WebSockets을 사용할 때, WebSocketGateway 클래스가 필요로 하는 인터페이스들
  // 이 인터페이스를 구현하지 않으면 WebSocketGateway가 올바르게 작동 X
  @WebSocketServer() server: Socket;
  private alarmClients: Set<string> = new Set();

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(`= Alarm Client connected: ${client.id}`);

    if (!this.alarmClients.has(client.id)) {
      this.alarmClients.add(client.id);
    } else {
      client.disconnect();
    }

    console.log("= alarmClients: ", this.alarmClients.size);
  }

  handleDisconnect(client: Socket) {
    console.log(`= Alarm Client disconnect: ${client.id}`);
    this.alarmClients.delete(client.id);
    client.disconnect();

    console.log(`= AlarmClients.size: ${this.alarmClients.size}`);
  }

  @SubscribeMessage("join")
  handleJoin(client: Socket, payload: { userId: number }) {
    client.join(`user-${payload.userId}`);
  }

  @SubscribeMessage("comment")
  handleCommentCreatedEvent(payload: CommentCreatedAlarm, to: number): void {
    console.log("handleCommentCreatedEvent", payload, to);
    // 게시글 주인에게 댓글 알림
    this.server.to(`user-${to}`).emit("comment", { payload });
  }

  @SubscribeMessage("chat")
  handleNewChatEvent(users: User[], message: Message): void {
    const payload = {
      chatRoomId: message.chatRoom.chatRoomId,
      chatRoomName: message.chatRoom.name,
      messageId: message.messageId,
      message: message.content,
      createdAt: message.createdAt
    };

    // 나 아닌 채팅방 참여자들에게 알림 보냄
    users
      .filter(user => user.userId !== message.sender.userId)
      .forEach(user => {
        this.server.to(`user-${user.userId}`).emit("chat", { payload });
      });
  }
}