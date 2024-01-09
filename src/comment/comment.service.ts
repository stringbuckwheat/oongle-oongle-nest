import { Body, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "./comment.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../user/entities/user.entity";
import { Board } from "../board/board.entity";
import { CommentDto } from "./dto/comment.dto";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>
  ) {
  }

  async create(commentData): Promise<CommentDto> {
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

  private async createCommentWithParent(commentId: number, options: Partial<Comment>): Promise<CommentDto> {
    if (commentId) {
      const parentComment = await this.findById(commentId);
      options.parentComment = parentComment;
    }

    const comment = this.commentRepository.create(options);
    return this.mapToCommentDto(await this.commentRepository.save(comment));
  }

  private mapToCommentDto(comment: Comment): CommentDto {
    return {
      commentId: comment.commentId,
      content: comment.content,
      createdAt: this.handleDate(comment.createdAt),
      name: comment.name ?? comment.user.name,
      userId: comment.name ? null : comment.user?.userId ?? null,
      replies: [],
      deps: comment.parentComment ? 1 : 0
    };
  }

  private handleDate(date: Date): string {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // 오늘 날짜면
    if (date.toISOString().split("T")[0] === today) {
      // 시:분으로 가공
      return date.toISOString().split("T")[1].substring(0, 5);
    }

    // 오늘 날짜가 아니면 해당 날짜 리턴
    return date.toISOString().split("T")[0];
  }

  async verify(@Body() verifyData): Promise<any> {
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
