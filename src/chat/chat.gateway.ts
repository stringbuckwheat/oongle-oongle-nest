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
import { MessageResponseDto } from "./dto/message-response.dto";
import { Type } from "class-transformer";
import { ChatRoomRequestDto } from "./dto/chat-room-request.dto";

@WebSocketGateway({
  namespace: "chat", // 네임스페이스 설정
  cors: {
    origin: ["http://localhost:3000"]
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private chatClients: Set<string> = new Set();

  constructor(private readonly chatService: ChatService) {
  }

  handleConnection(socket: Socket) {
    console.log(`Chat Client connected: ${socket.id}`);

    if (!this.chatClients.has(socket.id)) {
      console.log(`new connection started | client: ${socket.id}`);
      this.chatClients.add(socket.id);
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

    socket.disconnect();
  }

  @SubscribeMessage("join/userId")
  async joinChatRoomByUserIds(client: Socket, payload: ChatRoomRequestDto) {
    console.log("joinChatRoomByUserIds");
    const userIds = payload.userIds.map(userId => parseInt(userId.toString(), 10));

    const res = await this.chatService.createOrFindChatRoomByUserIds(userIds);
    client.join(`room-${res.chatRoomId}`);

    this.server.to(`room-${res.chatRoomId}`).emit("user/join", res);
  }

  @SubscribeMessage("join")
  async joinChatRoomByChatRoomId(client: Socket, payload: { chatRoomId: number }) {
    console.log("joinChatRoomByChatRoomId = ", payload);
    const res = await this.chatService.getRoomByChatRoomId(payload.chatRoomId);
    client.join(`room-${res.chatRoomId}`);

    this.server.to(`room-${res.chatRoomId}`).emit("user/join", res);
  }

  @SubscribeMessage("send")
  async handleMessage(client: Socket, payload: MessageRequestDto) {
    // DB 저장
    const message = await this.chatService.saveMessage(payload);
    const response = new MessageResponseDto(message, payload.chatRoomId);

    // 클라이언트의 on 메소드와 연결
    this.server.to(`room-${payload.chatRoomId}`).emit("receive", response);

    // 실시간 알림
    this.server.to(`room-${payload.chatRoomId}`).emit("notification", response);
  }
}
