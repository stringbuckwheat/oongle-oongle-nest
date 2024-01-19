import { Body, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatRoom } from "./entity/chat-room.entity";
import { Repository } from "typeorm";
import { Message } from "./entity/message.entity";
import { UserChatRoom } from "./entity/user-chat-room.entity";
import { User } from "../user/user.entity";
import { ChatRoomDto } from "./dto/chat-room.dto";
import { MessageDto } from "./dto/message.dto";

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

  async getRoomByChatRoomId(chatRoomId: number): Promise<any> {
    // chatRoom 정보
    const chatRoom = await this.chatRoomRepository.findOne({
      where: {
        chatRoomId
      },
      relations: ["participants", "messages", "messages.sender"]
    });

    return {
      title: chatRoom.name,
      chatRoomId: chatRoom.chatRoomId,
      participants: chatRoom.participants.length,
      messages: chatRoom.messages.map((message) => new MessageDto(message))
    };
  }

  async getRoomByUserIds(userIds: number[]): Promise<ChatRoom> {
    const existingChatRoom = await this.userChatRoomRepository
      .createQueryBuilder("userChatRoom")
      .innerJoin("userChatRoom.user", "user")
      .innerJoinAndSelect("userChatRoom.chatRoom", "chatRoom")

      .where("userChatRoom.user.userId IN (:...userIds)", {userIds})
      .groupBy("userChatRoom.chatRoom.chatRoomId")
      .having("COUNT(userChatRoom.user.userId) = :count", {count: userIds.length})
      .getOne();

    // 해당 채팅방 이미 존재
    if (existingChatRoom) {
      return existingChatRoom.chatRoom;
    }

    // 없으면 create
    // 해당 유저 찾기
    const users = await Promise.all(userIds.map(userId =>
      this.userRepository.findOne({ where: { userId } })));

    // chatRoom 제목짓기
    const name = users.map(user => user.name).join(', ');

    // chatRoom 생성
    const chatRoom = this.chatRoomRepository.create({ name });
    const savedChatRoom = await this.chatRoomRepository.save(chatRoom);

    // 채팅방 참가자 추가
    await Promise.all(
      users.map((user) => this.addUserToChatRoom(user, savedChatRoom))
    )

    // 방 정보, 상대 정보 리턴
    return savedChatRoom;
  }

  // 채팅방 구성원 추가
  private async addUserToChatRoom(user: User, chatRoom: ChatRoom): Promise<void> {
    const userChatRoomEntry = this.userChatRoomRepository.create({
      user,
      chatRoom: chatRoom
    });

    await this.userChatRoomRepository.save(userChatRoomEntry);
  }

  async saveMessage(roomId: number, senderId: number, content: string): Promise<MessageDto> {
    const chatRoom = await this.chatRoomRepository.findOne({ where: { chatRoomId: roomId } });
    const sender = await this.userRepository.findOne({ where: { userId: senderId } });

    if (!chatRoom || !sender) {
      throw new NotFoundException("그런 방이나 사용자 없음");
    }

    const message = this.messageRepository.create({
      chatRoom,
      sender,
      content
    });

    const savedMessage = await this.messageRepository.save(message);

    return new MessageDto(savedMessage);
  }
}
