import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatRoom } from "./entity/chat-room.entity";
import { DataSource, getManager, LessThan, Repository, Transaction } from "typeorm";
import { Message } from "./entity/message.entity";
import { UserChatRoom } from "./entity/user-chat-room.entity";
import { User } from "../user/user.entity";
import { ChatRoomDto } from "./dto/chat-room.dto";
import { MessageRequestDto } from "./dto/message-request.dto";
import { UserMessageRead } from "./entity/user-message-read.entity";
import { AlarmGateway } from "../alarm/alarm.gateway";
import { ChatRoomListDto } from "./dto/chat-room-list.dto";

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
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMessageRead)
    private readonly userMessageReadRepository: Repository<UserMessageRead>,
    private readonly alarmGateway: AlarmGateway,
    private dataSource: DataSource
  ) {
  }

  async getAllByUserId(user): Promise<ChatRoomListDto[]> {
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
    const rooms = chatRooms.flatMap((userChatRoom) => userChatRoom.chatRoom);
    return rooms.map((room) => new ChatRoomListDto(room));
  }

  async getRoomByChatRoomId(chatRoomId: number): Promise<ChatRoomDto> {
    console.log("chatRoomId", chatRoomId);

    // chatRoom 정보
    const chatRoom = await this.chatRoomRepository.findOne({
      where: {
        chatRoomId
      },
      relations: ["messages", "messages.sender"]
    });

    return new ChatRoomDto(chatRoom);
  }

  async createOrFindChatRoomByUserIds(userIds: number[]): Promise<ChatRoomDto> {
    const existingChatRoom = await this.findChatRoomByUserIds(userIds);

    if (existingChatRoom && this.isChatRoomExist(userIds, existingChatRoom.chatRoomId)) {
      console.log("채팅방 이미 존재");
      return await this.getRoomByChatRoomId(existingChatRoom.chatRoomId);
    }

    console.log("채팅방 없음");
    const savedChatRoom = await this.addChatRoom(userIds);
    return new ChatRoomDto(savedChatRoom);
  }

  private async findChatRoomByUserIds(userIds: number[]): Promise<any | null> {
    const existingChatRoom = await this.userChatRoomRepository
      .createQueryBuilder("userChatRoom")
      .innerJoinAndSelect("userChatRoom.chatRoom", "chatRoom")
      .groupBy("userChatRoom.chatRoom.chatRoomId")
      .having("COUNT(DISTINCT userChatRoom.user.userId) = :count AND userChatRoom.user.userId IN (:...userIds)"
        , { count: userIds.length, userIds })
      .getOne();

    console.log("existingChatRoom", existingChatRoom);

    return existingChatRoom
      ? { chatRoomId: existingChatRoom.chatRoom.chatRoomId }
      : null;
  }

  private async isChatRoomExist(userIds: number[], chatRoomId: number): Promise<boolean> {
    const ucrs = await this.userChatRoomRepository.find({
      where: {
        chatRoom: {
          chatRoomId
        }
      },
      relations: ["user"]
    });

    const participantsId = ucrs.map((ucr) => ucr.user.userId);

    console.log("participantsId", participantsId);
    console.log("userIds", userIds);

    return participantsId.every(value => new Set(userIds).has(value));
  }

  private async addChatRoom(userIds: number[]): Promise<ChatRoom> {
    // transaction
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 없으면 create
      // 해당 유저 찾기
      const users = await Promise.all(
        userIds.map(userId => this.userRepository.findOneOrFail({ where: { userId } }))
      );

      console.log("users", users.length);

      // chatRoom 제목짓기
      const name = users.map(user => user.name).join(", ");

      // chatRoom 생성
      const chatRoom = this.chatRoomRepository.create({ name });
      // const savedChatRoom = await this.chatRoomRepository.save(chatRoom);
      const savedChatRoom = await queryRunner.manager.save(chatRoom);
      console.log("chat room 생성 완료");

      // 채팅방 참가자 추가
      await Promise.all(
        users.map(async (user) => {
          const userChatRoom = this.userChatRoomRepository.create({
            user,
            chatRoom
          });

          // await this.userChatRoomRepository.save(userChatRoomEntry);
          await queryRunner.manager.save(userChatRoom);
        })
      );

      console.log("채팅방 참가자 추가 완료");

      await queryRunner.commitTransaction();
      console.log("commit 완료");

      // 방 정보, 상대 정보 리턴
      return savedChatRoom;
    } catch (e) {
      console.log("error 발생", e);
      await queryRunner.rollbackTransaction();
    } finally {
      console.log("catch 블록");
      await queryRunner.release();
    }
  }

  async saveMessage(chatMessage: MessageRequestDto): Promise<Message> {
    console.log("save messages");
    const { chatRoomId, senderId, message } = chatMessage;

    const [chatRoom, sender] = await Promise.all([
      this.chatRoomRepository.findOne({ where: { chatRoomId } }),
      this.userRepository.findOne({ where: { userId: senderId } })
    ]);

    console.log("chatRoom", chatRoom);

    if (!chatRoom || !sender) {
      console.log("그런 방이나 사용자 없음");
      throw new NotFoundException("그런 방이나 사용자 없음");
    }

    // 엔티티 생성
    const newMessage = this.messageRepository.create({
      chatRoom,
      sender,
      content: message
    });

    // DB 저장
    const savedMessage = await this.messageRepository.save(newMessage);

    console.log("메시지 저장 완료, 참가자 확인 여부 저장 시작");
    const ucrs = await this.userChatRoomRepository.createQueryBuilder("ucr")
      .innerJoinAndSelect("ucr.user", "user")
      .innerJoin("ucr.chatRoom", "chatRoom")
      .where("chatRoom.chatRoomId = :chatRoomId", { chatRoomId })
      .getMany();

    console.log("ucrs", ucrs);

    const participants = ucrs.map((ucr) => ucr.user);

    // 채팅방 참가자에 대해 확인 여부 저장
    const promises = participants.map(async participant => {
      const userMessageRead = this.userMessageReadRepository.create({
        user: participant,
        message: savedMessage,
        readAt: participant.userId == senderId ? new Date() : null // 메시지 보낸 사람은 바로 읽음 처리
      });

      await this.userMessageReadRepository.save(userMessageRead);
    });

    await Promise.all(promises);

    // socket 알림
    this.alarmGateway.handleNewChatEvent(participants, savedMessage);

    return savedMessage;
  }

  // 읽음 처리
  // 해당 Message보다 createdAt이 과거인 모든 메시지 읽음 처리
  async markedMessageAsRead(messageId: number, userId: number): Promise<{ messageId: number }> {
    // 해당 유저
    const user = await this.userRepository.findOne({
      where: { userId }
    });

    const message = await this.messageRepository.findOne({
      where: { messageId }
    });

    // 해당 메시지 이전의 모든 메시지 들고오기
    const messageToMarkAsRead = await this.messageRepository.find({
      where: {
        chatRoom: message.chatRoom,
        createdAt: LessThan(message.createdAt)
      }
    });

    await Promise.all(
      messageToMarkAsRead.map(async (messageToMark) => {
        await this.userMessageReadRepository.save({
          user,
          message: messageToMark,
          readAt: new Date()
        });
      })
    );

    return { messageId };
  }
}
