import { Injectable, NotFoundException } from "@nestjs/common";
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

    // 비회원의 경우 비밀번호 암호화
    if (commentData.password) {
      const encrypt = await bcrypt.hash(commentData.password, 10);

      const comment = this.commentRepository.create({
        content: commentData.content,
        board,
        name: commentData.name,
        password: encrypt
      });

      return this.mapToCommentDto(await this.commentRepository.save(comment));
    }

    // 회원일 경우
    const user = await this.userRepository.findOneOrFail({
      where: {
        userId: commentData.userId
      }
    });

    const comment = this.commentRepository.create({
      content: commentData.content, board, user
    });

    return this.mapToCommentDto(await this.commentRepository.save(comment));
  }

  private mapToCommentDto(comment: Comment): CommentDto {
    return {
      commentId: comment.commentId,
      content: comment.content,
      createdAt: this.handleDate(comment.createdAt),
      name: comment.name ?? comment.user.name,
      userId: comment.name ? null : comment.user?.userId ?? null,
      replies: []
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

  async update(commentId: number, updateData: Partial<Comment>): Promise<Comment> {
    const comment = await this.findById(commentId);
    Object.assign(comment, updateData);
    return this.commentRepository.save(comment);
  }

  async delete(commentId: number): Promise<void> {
    const comment = await this.findById(commentId);
    await this.commentRepository.remove(comment);
  }
}
