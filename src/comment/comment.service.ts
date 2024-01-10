import { Body, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "./comment.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../user/entities/user.entity";
import { Board } from "../board/board.entity";
import { CommentResponseDto } from "./dto/commentResponse.dto";
import { AlarmGateway } from "../alarm/alarm.gateway";
import { CommentCreatedAlarm } from "../alarm/dto/commentCreatedAlarm.dto";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    private readonly alarmGateway: AlarmGateway,
  ) {
  }

  async create(commentData): Promise<CommentResponseDto> {
    const board = await this.boardRepository.findOneOrFail({
      where: {
        boardId: commentData.boardId
      }
    });

    const commonOptions = {
      content: commentData.content,
      board,
    };

    if (commentData.password) {
      const encrypt = await bcrypt.hash(commentData.password, 10);
      const passwordOptions = { ...commonOptions, name: commentData.name, password: encrypt };
      return this.createCommentWithParent(commentData.commentId, passwordOptions);
    }

    const user = await this.userRepository.findOneOrFail({
      where: {
        userId: commentData.userId
      }
    });

    const userOptions = { ...commonOptions, user };
    return this.createCommentWithParent(commentData.commentId, userOptions);
  }

  private async createCommentWithParent(commentId: number, options: Partial<Comment>): Promise<CommentResponseDto> {
    if (commentId) {
      const parentComment = await this.findById(commentId);
      options.parentComment = parentComment;
    }

    const entity = this.commentRepository.create(options);
    const comment = await this.commentRepository.save(entity);

    // 댓글 작성 시 글 주인에게 socket 알림
    this.alarmGateway.handleCommentCreatedEvent(new CommentCreatedAlarm(comment));

    return new CommentResponseDto(comment);
  }

  async verify(@Body() verifyData): Promise<{ commentId: number, verify: boolean }> {
    const comment = await this.findById(verifyData.commentId);
    const isPasswordMatch = await bcrypt.compare(verifyData.password, comment.password);

    if(!isPasswordMatch) {
      throw new UnauthorizedException("비밀번호 불일치");
    }

    return { commentId: comment.commentId, verify: isPasswordMatch };;
  }

  async findById(commentId: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: {
        commentId: commentId
      }
    });

    if (!comment) {
      throw new NotFoundException("댓글 없음");
    }

    return comment;
  }

  async delete(commentId: number): Promise<void> {
    const comment = await this.findById(commentId);
    await this.commentRepository.remove(comment);
  }
}
