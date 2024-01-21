import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatRoom } from "./entity/chat-room.entity";
import { Repository } from "typeorm";
import { Message } from "./entity/message.entity";
import { UserChatRoom } from "./entity/user-chat-room.entity";
import { User } from "../user/user.entity";
import { ChatRoomDto } from "./dto/chat-room.dto";
import { MessageResponseDto } from "./dto/message-response.dto";
import { MessageRequestDto } from "./dto/message-request.dto";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(UserChatRoom)
    private readonly userChatRoomRepository: Repository<UserChatRoom>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
  }

  async getAllByUserId(user): Promise<ChatRoom[]> {
    // 해당 유저가 속한 모든 채팅방 목록
    // 가장 최근 메시지를 포함해서 DESC
    const chatRooms = await this.userChatRoomRepository
      .createQueryBuilder("userChatRoom")
      .innerJoinAndSelect("userChatRoom.user", "user")
      .innerJoinAndSelect("userChatRoom.chatRoom", "chatRoom")
      .leftJoinAndSelect("chatRoom.messages", "messages")
      .where("user.userId = :userId", { userId: user.userId })
      .getMany();

    // map vs. flatMap
    return chatRooms.flatMap((userChatRoom) => userChatRoom.chatRoom);
  }

  async getRoomByChatRoomId(chatRoomId: number): Promise<ChatRoomDto> {
    console.log("chatRoomId", chatRoomId);

    // chatRoom 정보
    const chatRoom = await this.chatRoomRepository.findOne({
      where: {
        chatRoomId
      },
      relations: ["participants", "messages", "messages.sender"]
    });

    console.log("chatRoom", chatRoom);

    return new ChatRoomDto(chatRoom);
  }

  /**
   *
   * @param userIds
   */

  //SELECT *
  // FROM user_chat_room userChatRoom
  // INNER JOIN user ON userChatRoom.userUserId = user.userId
  // INNER JOIN chat_room chatRoom ON userChatRoom.chatRoomChatRoomId  = chatRoom.chatRoomId
  // LEFT JOIN message messages ON chatRoom.chatRoomId = messages.chatRoomChatRoomId
  // WHERE userChatRoom.userUserId IN (1, 7)
  // GROUP BY userChatRoom.chatRoomChatRoomId
  // HAVING COUNT(DISTINCT userChatRoom.userUserId) = 2;
  async getRoomByUserIds(userIds: number[]): Promise<ChatRoomDto> {
    const existingChatRoom = await this.userChatRoomRepository
      .createQueryBuilder("userChatRoom")
      .innerJoinAndSelect("userChatRoom.chatRoom", "chatRoom")
      .where("userChatRoom.user.userId IN (:...userIds)", { userIds })
      .groupBy("userChatRoom.chatRoom.chatRoomId")
      .having("COUNT(userChatRoom.user.userId) = :count", { count: userIds.length })
      .getOne();

    console.log("existingChatRoom", existingChatRoom);

    // 해당 채팅방 이미 존재
    if (existingChatRoom) {
      console.log("채팅방 이미 존재")
      return await this.getRoomByChatRoomId(existingChatRoom.chatRoom.chatRoomId);
    }

    console.log("채팅방 없음")

    // 없으면 create
    // 해당 유저 찾기
    const users = await Promise.all(userIds.map(userId =>
      this.userRepository.findOne({ where: { userId } })));

    // chatRoom 제목짓기
    const name = users.map(user => user.name).join(", ");

    // chatRoom 생성
    const chatRoom = this.chatRoomRepository.create({ name });
    const savedChatRoom = await this.chatRoomRepository.save(chatRoom);

    // 채팅방 참가자 추가
    await Promise.all(
      users.map((user) => this.addUserToChatRoom(user, savedChatRoom))
    );

    // 방 정보, 상대 정보 리턴
    return new ChatRoomDto(savedChatRoom);
  }

  // 채팅방 구성원 추가
  private async addUserToChatRoom(user: User, chatRoom: ChatRoom): Promise<void> {
    const userChatRoomEntry = this.userChatRoomRepository.create({
      user,
      chatRoom: chatRoom
    });

    await this.userChatRoomRepository.save(userChatRoomEntry);
  }

  async saveMessage(messageReq: MessageRequestDto): Promise<MessageResponseDto> {
    const { chatRoomId, senderId } = messageReq;

    const chatRoom = await this.chatRoomRepository.findOne({ where: { chatRoomId: chatRoomId } });
    const sender = await this.userRepository.findOne({ where: { userId: senderId } });

    if (!chatRoom || !sender) {
      throw new NotFoundException("그런 방이나 사용자 없음");
    }

    const message = this.messageRepository.create({
      chatRoom,
      sender,
      content: messageReq.message
    });

    const savedMessage = await this.messageRepository.save(message);

    return new MessageResponseDto(savedMessage, chatRoomId);
  }

  // in memory에 메시지 10개 이상 쌓이면 DB 저장
  async saveMessages(inMemoryMessages: MessageRequestDto[]): Promise<void> {
    const { chatRoomId, senderId } = inMemoryMessages[0];

    // relations
    const chatRoom = await this.chatRoomRepository.findOne({ where: { chatRoomId: chatRoomId } });
    const sender = await this.userRepository.findOne({ where: { userId: senderId } });

    if (!chatRoom || !sender) {
      throw new NotFoundException("그런 방이나 사용자 없음");
    }

    // 전체 엔티티 생성
    const entities = inMemoryMessages.map((message) => {
      return this.messageRepository.create({
        chatRoom,
        sender,
        content: message.message
      });
    });

    // DB 저장
    await this.messageRepository.save(entities);
  }
}
