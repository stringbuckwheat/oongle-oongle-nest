import { Injectable } from '@nestjs/common';
import { CommentCreatedAlarm } from "./dto/commentCreatedAlarm.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "../comment/comment.entity";
import { Repository } from "typeorm";
import { UserMessageRead } from "../chat/entity/user-message-read.entity";

@Injectable()
export class AlarmService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(UserMessageRead)
    private readonly userMessageRepository: Repository<UserMessageRead>,
  ) {
  }

  // 사용자 알림
  async getAlarms(userId: number): Promise<any> {
    return {
      unCheckedComments: await this.getCommentAlarm(userId),
      unReadMessages: await this.getUnReadMessage(userId)
    };
  }

  async getCommentAlarm(userId: number): Promise<CommentCreatedAlarm[]> {
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

    return unCheckedComments.map((comment) => new CommentCreatedAlarm(comment));
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
