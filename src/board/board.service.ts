import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "./board.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../user/entities/user.entity";
import { BoardDto } from "./dto/board.dto";
import { BoardDetail } from "./dto/detail.dto";
import { Comment } from "../comment/comment.entity";
import { CommentDto } from "../comment/dto/comment.dto";

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepostiory: Repository<User>
  ) {
  }

  async findAll(): Promise<BoardDto[]> {
    const boards = await this.boardRepository.createQueryBuilder("board")
      .leftJoinAndSelect("board.user", "user") // user: 연결된 엔티티의 별칭
      .leftJoinAndSelect("board.likes", "likes")
      .orderBy("board.createdAt", "DESC")
      .take(10)
      .getMany();

    return boards.map(board => this.mapBoardToDto(board));
  }

  private mapBoardToDto(board: Board): BoardDto {
    return ({
      boardId: board.boardId,
      title: board.title,
      name: board.name ?? board.user?.name ?? "",
      memberId: board.name ? null : board.user?.userId ?? null,
      isMember: board.name == null,
      createdAt: this.transformCreateDate(board.createdAt), // 오늘이면 시간, 아니면 날짜
      hits: board.hits,
      likes: board.likes?.length ?? 0
    });
  }

  async getPopular(): Promise<BoardDto[]> {
    const populars = await this.boardRepository.createQueryBuilder("board")
      .leftJoinAndSelect("board.user", "user") // user: 연결된 엔티티의 별칭
      .leftJoinAndSelect("board.likes", "likes")
      .addSelect("COUNT(likes.likeId)", "likesCount")
      .groupBy("board.boardId")
      .orderBy("likesCount", "DESC")
      .take(5)
      .getMany();

    return populars.map(board => this.mapBoardToDto(board));
  }

  private transformCreateDate(date: Date): string {
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

  async findById(boardId: number): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: {
        boardId: boardId
      }
    });

    if (!board) {
      throw new NotFoundException("글 없음");
    }

    return board;
  }

  async getDetail(boardId: number): Promise<BoardDetail> {
    // relations은 where 조건 못 검
    // Replies로 self join 되어 있으므로, parentComment가 없는 댓글만 들고와야 함
    // const board = await this.boardRepository.findOne({
    //   where: {
    //     boardId: boardId
    //   },
    //   relations: ["user", "likes", "comments", "comments.user", "comments.replies", "comments.parentComment", "comments.replies.user"] // join
    // });

    const board = await this.boardRepository.createQueryBuilder("board")
      .leftJoinAndSelect("board.user", "user")
      .leftJoinAndSelect("board.likes", "likes")
      .leftJoinAndSelect("board.comments", "comments")
      .leftJoinAndSelect("comments.user", "commentUser")
      .leftJoinAndSelect("comments.replies", "replies")
      .leftJoinAndSelect("replies.user", "replyUser")
      .where("comments.parentComment IS NULL") // 대댓글이 아닌 댓글만 들고옴
      .andWhere("board.boardId = :boardId", { boardId })
      .getOne();

    // 조회수 업데이트
    await this.boardRepository.update(boardId, { hits: board.hits + 1 });

    // DTO Return
    return {
      boardId: board.boardId,
      title: board.title,
      name: board.name ?? board.user?.name ?? "",
      memberId: board.name ? null : board.user?.userId ?? null,
      isMember: board.name == null,
      createdAt: board.createdAt.toISOString().replace("T", " ").split(".")[0],
      hits: board.hits,
      likes: board.likes?.length ?? 0,

      content: board.content,
      comments: board.comments.map(comment => this.mapToCommentDto(comment))
    };
  }

  private mapToCommentDto(comment: Comment): CommentDto {
    return ({
      commentId: comment.commentId,
      content: comment.content,
      name: comment.name ? comment.name : comment.user.name,
      userId: comment.name ? null : comment.user?.userId ?? null,
      createdAt: this.transformCreateDate(comment.createdAt),
      replies: comment.replies?.map(reply => this.mapToCommentDto(reply)) ?? [],
      deps: comment.parentComment ? 1 : 0
    });
  }

  async hashedBoard(postData: Partial<Board>): Promise<Partial<Board>> {
    const hashedPassword = await bcrypt.hash(postData.password, 10); // 10 == saltRounds
    return { ...postData, password: hashedPassword };
  }

  async create(postData): Promise<Board> {
    // 비회원일 경우
    if (postData.password) {
      // 비밀번호 암호화
      const encrypt = await this.hashedBoard(postData);
      const board = this.boardRepository.create(encrypt);
      return this.boardRepository.save(board);
    }

    // 회원일 경우
    const user = await this.userRepostiory.findOneOrFail({
      where: {
        userId: postData.userId
      }
    });

    const board = this.boardRepository.create({
      user,
      title: postData.title,
      content: postData.content
    });

    return this.boardRepository.save(board);
  }

  async verifyAnonymous(verifyData): Promise<any> {
    const prevBoard = await this.findById(verifyData.boardId);
    const isPasswordMatch = await bcrypt.compare(verifyData.password, prevBoard.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException("비밀번호 불일치");
    }

    return { boardId: prevBoard.boardId, verify: isPasswordMatch };
  }

  async update(id: number, updateData): Promise<Board> {
    const board = await this.findById(id);

    if (!board) {
      throw new Error("글이 존재하지 않습니다.");
    }

    // 수정된 내용 업데이트
    // 회원이면 바로 updateData, 아니면 hash 해줘야함
    if (updateData.password) {
      updateData = await this.hashedBoard(updateData);
    }

    Object.assign(board, updateData);

    return await this.boardRepository.save(board);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id); // Check if board exists
    await this.boardRepository.delete(id);
  }
}
