import { Body, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatRoom } from "./entity/chat-room.entity";
import { Repository } from "typeorm";
import { Message } from "./entity/message.entity";
import { UserChatRoom } from "./entity/user-chat-room.entity";
import { User } from "../user/user.entity";

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

  async getRoomByUserId(@Body() data: { myUserId: number, yourUserId: number }): Promise<any> {
    const { myUserId, yourUserId } = data;

    // 내 userId와 상대의 userId로 이루어진 1:1 채팅 찾기
    const room = await this.userChatRoomRepository.find({
      where: [
        {
          user: { userId: myUserId }
        }, {
          user: { userId: yourUserId }
        }
      ],
      relations: ["chatRoom"]
    });

    // 없으면 만들기
    if (room.length == 0) {
      // 해당 유저 찾기

      const [userA, userB] = await Promise.all([
        this.userRepository.findOne({ where: { userId: myUserId } }),
        this.userRepository.findOne({ where: { userId: yourUserId } })
      ]);

      // chatRoom 제목 짓기
      const name = `${userA.name}, ${userB.name}`;

      // chatRoom 생성
      const chatRoom = this.chatRoomRepository.create({ name });
      const savedChatRoom = await this.chatRoomRepository.save(chatRoom);

      // 채팅방 참가자 추가
      await Promise.all([
        this.addUserToChatRoom(userA, savedChatRoom),
        this.addUserToChatRoom(userB, savedChatRoom)
      ]);

      // 방 정보, 상대 정보 리턴
      return {
        title: userB.name, // 상대방 이름
        chatRoomId: savedChatRoom.chatRoomId,
        participants: 2,
        messages: []
      };
    }

    // 이미 존재하는 채팅방의 경우
    const user = await this.userRepository.findOne({ where: { userId: yourUserId } });
    const messages = await this.messageRepository.find({
      where: {
        chatRoom: {
          chatRoomId: room[0].chatRoom.chatRoomId,
        }
      }
    })

    // 방 정보, 지난 메시지 리턴
    return {
      title: user.name, // 상대방 이름
      chatRoomId: room[0].chatRoom.chatRoomId,
      participants: 2,
      messages
    };
  }

  // 채팅방 구성원 추가
  private async addUserToChatRoom(user: User, chatRoom: ChatRoom): Promise<void> {
    const userChatRoomEntry = this.userChatRoomRepository.create({
      user,
      chatRoom: chatRoom
    });

    await this.userChatRoomRepository.save(userChatRoomEntry);
  }

  async saveMessage(roomId: number, senderId: number, content: string): Promise<Message> {
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

    return await this.messageRepository.save(message);
  }

  async joinRoom(userId: number, chatRoomId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { userId } });
    const chatRoom = await this.chatRoomRepository.findOne({ where: { chatRoomId } });

    if (!user || !chatRoom) {
      throw new NotFoundException("그런 방이나 사용자 없음");
    }

    const existingEntry = await this.userChatRoomRepository.findOne({ where: { user, chatRoom } });

    if (!existingEntry) {
      const userChatRoomEntry = this.userChatRoomRepository.create({ user, chatRoom });
      await this.userChatRoomRepository.save(userChatRoomEntry);
    }
  }
}
