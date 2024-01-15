import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000"]
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {
  }

  async handleConnection(socket: Socket) {
  }

  async handleDisconnect(socket: Socket) {
  }

  @SubscribeMessage("joinRoom")
  async handleJoinRoom(client: Socket, payload: { myUserId: number, yourUserId: number }) {
    const res = await this.chatService.getRoomByUserId(payload);
    client.join(`room-${res.chatRoomId}`);

    this.server.to(`room-${res.chatRoomId}`).emit("userJoined", res);
  }

  @SubscribeMessage("sendMessage")
  async handleMessage(client: Socket, payload: { chatRoomId: number; senderId: number; content: string }) {
    const { chatRoomId, senderId, content } = payload;
    const message = await this.chatService.saveMessage(chatRoomId, senderId, content);

    // 클라이언트의 on 메소드와 연결
    this.server.to(`room-${chatRoomId}`).emit("receiveMessage", message);
  }
}
