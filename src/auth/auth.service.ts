import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Comment } from "../comment/comment.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentCreatedAlarm } from "../alarm/dto/commentCreatedAlarm.dto";
import { LoginDto } from "./dto/login.dto";
import { User } from "../user/user.entity";
import { AuthUser } from "./dto/authUser.dto";
import { UserChatRoom } from "../chat/entity/user-chat-room.entity";
import { UserMessageRead } from "../chat/entity/user-message-read.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(UserChatRoom)
    private readonly userChatRoomRepository: Repository<UserChatRoom>,
    @InjectRepository(UserMessageRead)
    private readonly userMessageRepository: Repository<UserMessageRead>
  ) {
  }

  async validateUser(username: string): Promise<User> {
    return await this.userService.findByUsername(username);
  }

  async findByUserId(userId: number): Promise<User> {
    return await this.userService.findByUserId(userId);
  }

  async login(loginDto: LoginDto): Promise<AuthUser> {
    // DB 검증 로직
    const user = await this.userService.findByUsername(loginDto.username);

    // ID, PW 검사
    if (!user || !bcrypt.compare(loginDto.password, user.password)) {
      console.log(!user ? "그런 사용자 없음" : "비번 틀림");
      throw new UnauthorizedException();
    }

    // access token payload
    const payload = { sub: user.userId, iss: "nest-board", aud: "api-server" };

    // JWT access token, 기본 사용자 정보
    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.userId,
      username: user.username,
      name: user.name,
      alarms: await this.getCommentAlarm(user.userId)
    };
  }

  // 사용자 알림
  async getCommentAlarm(userId: number): Promise<any> {
    const unCheckedComments = await this.commentRepository.find({
      where: {
        board: {
          user: { userId } // 본인이 작성한 글
        },
        checked: false // 확인하지 않은 댓글만
      },
      order: {
        createdAt: "DESC"
      },
      relations: ["user", "board"]
    });

    const unReadMessages = await this.getUnReadMessage(userId);

    const result = {
      unCheckedComments: unCheckedComments.map((comment) => new CommentCreatedAlarm(comment)),
      unReadMessages
    };

    return result;
  }

  async getUnReadMessage(userId: number) {
    const unReadMessages = await this.userMessageRepository
      .createQueryBuilder("umr")
      .innerJoin("umr.user", "user")
      .innerJoinAndSelect("umr.message", "message")
      .innerJoinAndSelect("message.chatRoom", "chatRoom")
      .where("user.userId = :userId", { userId })
      .andWhere("umr.readAt IS NULL")
      .orderBy("umr.userMessageReadId", "DESC")
      .getMany();

    return unReadMessages.map((umr) => (
      {
        userMessageReadId: umr.userMessageReadId,
        chatRoomId: umr.message.chatRoom.chatRoomId,
        chatRoomName: umr.message.chatRoom.name,
        messageId: umr.message.messageId,
        message: umr.message.content,
        createdAt: umr.message.createdAt
      }
    ));
  }
}
