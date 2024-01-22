import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { MessageRequestDto } from "./dto/message-request.dto";

@WebSocketGateway({
  namespace: "chat", // 네임스페이스 설정
  cors: {
    origin: ["http://localhost:3000"]
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  // 메시지 임시 저장
  private inMemoryMessages: MessageRequestDto[] = [];
  private messageSavingLimit: number = 10;

  private chatClients: Set<string> = new Set();

  constructor(private readonly chatService: ChatService) {
  }

  handleConnection(socket: Socket) {
    console.log(`Chat Client connected: ${socket.id}`);

    if (!this.chatClients.has(socket.id)) {
      this.chatClients.add(socket.id);
      console.log("chatClients: ", this.chatClients.size);
    } else {
      // 중복된 연결이면 disconnect
      console.log(`Duplicate connection detected. Disconnecting client: ${socket.id}`);
      socket.disconnect();
    }

    console.log("chatClients: ", this.chatClients.size);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`* Client disconnected: ${socket.id}`);

    this.chatClients.delete(socket.id);
    console.log("* chatClients: ", this.chatClients.size);

    if (this.inMemoryMessages.length > 0) {
      console.log("* starting saving messages in databases...");
      console.log("* inMemoryMessages.length", this.inMemoryMessages.length);
      await this.chatService.saveMessages(this.inMemoryMessages);
      console.log("* 저장 완료!");
      this.inMemoryMessages = [];
    }

    socket.disconnect();
  }

  /**
   * 사용자 이름 눌러서 채팅할 때
   * @param client
   * @param payload
   */
  @SubscribeMessage("join/private")
  async handleJoinPrivateRoom(client: Socket, payload: number[]) {
    console.log("handleJoinPrivateRoom");
    const res = await this.chatService.getRoomByUserIds(payload);
    client.join(`room-${res.chatRoomId}`);

    this.server.to(`room-${res.chatRoomId}`).emit("user/join", res);
  }

  @SubscribeMessage("join")
  async joinChatRoom(client: Socket, payload: { chatRoomId: number }) {
    const res = await this.chatService.getRoomByChatRoomId(payload.chatRoomId);
    client.join(`room-${res.chatRoomId}`);

    this.server.to(`room-${res.chatRoomId}`).emit("user/join", res);
  }

  @SubscribeMessage("send")
  async handleMessage(client: Socket, payload: MessageRequestDto) {
    console.log("handle message payload", payload);

    // 클라이언트의 on 메소드와 연결
    this.server.to(`room-${payload.chatRoomId}`).emit("receive", payload);

    // 메모리에 임시 저장
    this.inMemoryMessages.push(payload);

    // 조건 만족 시 DB에 저장
    if (this.inMemoryMessages.length >= this.messageSavingLimit) {
      console.log("starting saving messages in databases... -> ", client.id);
      await this.chatService.saveMessages(this.inMemoryMessages);
      this.inMemoryMessages = [];
    }
  }
}
