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

  private chatClients = [];


  constructor(private readonly chatService: ChatService) {
  }

  handleConnection(socket: Socket) {
    console.log(`Chat Client connected: ${socket.id}`);
    this.chatClients.push(socket.id);
    console.log("chatClients: ", this.chatClients.length);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);

    this.chatClients = this.chatClients.filter((id) => id !== socket.id);
    console.log("chatClients: ", this.chatClients.length);

    if (this.inMemoryMessages.length > 0) {
      console.log("starting saving messages in databases...");
      await this.chatService.saveMessages(this.inMemoryMessages);
      console.log("저장 완료!");
    }

    socket.disconnect();
  }

  /**
   * 사용자 이름 눌러서 채팅할 때
   * @param client
   * @param payload
   */
  @SubscribeMessage("chat/join/private")
  async handleJoinPrivateRoom(client: Socket, payload: number[]) {
    const res = await this.chatService.getRoomByUserIds(payload);
    client.join(`room-${res.chatRoomId}`);

    this.server.to(`room-${res.chatRoomId}`).emit("chat/user/join", res);
  }

  @SubscribeMessage("chat/join")
  async joinChatRoom(client: Socket, payload: { chatRoomId: number }) {
    const res = await this.chatService.getRoomByChatRoomId(payload.chatRoomId);
    client.join(`room-${res.chatRoomId}`);

    this.server.to(`room-${res.chatRoomId}`).emit("chat/user/join", res);
  }

  @SubscribeMessage("chat/send")
  async handleMessage(client: Socket, payload: MessageRequestDto) {
    console.log("handle message payload", payload);
    // 메모리에 임시 저장
    this.inMemoryMessages.push(payload);

    // 클라이언트의 on 메소드와 연결
    this.server.to(`room-${payload.chatRoomId}`).emit("chat/receive", payload);

    // 조건 만족 시 DB에 저장
    if (this.inMemoryMessages.length >= this.messageSavingLimit) {
      console.log("starting saving messages in databases...");
      await this.chatService.saveMessages(this.inMemoryMessages);
      this.inMemoryMessages = [];
    }
  }
}
