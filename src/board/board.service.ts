import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "./board.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../user/user.entity";
import { BoardList } from "./dto/boardList.dto";
import { BoardDetail } from "./dto/detail.dto";
import { Comment } from "../comment/comment.entity";
import { VerifyResponse } from "./dto/verifyResponse.dto";
import { VerifyRequest } from "./dto/verifyRequest.dto";
import { UpdateBoard } from "./dto/update.dto";
import { BoardDto } from "./dto/board.dto";

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepostiory: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {
  }

  async findAll(): Promise<BoardList[]> {
    const boards = await this.boardRepository.createQueryBuilder("board")
      .leftJoinAndSelect("board.user", "user") // user: 연결된 엔티티의 별칭
      .leftJoinAndSelect("board.likes", "likes")
      .orderBy("board.createdAt", "DESC")
      .take(10)
      .getMany();

    return boards.map(board => new BoardList(board));
  }

  async getPopular(): Promise<BoardList[]> {
    const populars = await this.boardRepository.createQueryBuilder("board")
      .leftJoinAndSelect("board.user", "user") // user: 연결된 엔티티의 별칭
      .leftJoinAndSelect("board.likes", "likes")
      .addSelect("COUNT(likes.likeId)", "likesCount")
      .groupBy("board.boardId")
      .orderBy("likesCount", "DESC")
      .take(5)
      .getMany();

    return populars.map(board => new BoardList(board));
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
    return new BoardDetail(board);
  }

  async hashedBoard(rawPassword: string): Promise<string> {
    return await bcrypt.hash(rawPassword, 10); // 10 == saltRounds
  }

  async create(postData: BoardDto): Promise<Board> {
    // 비회원일 경우
    if (postData.password) {
      // 비밀번호 암호화
      const encrypt = await this.hashedBoard(postData.password);

      const board = this.boardRepository.create({...postData, password: encrypt});
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

  async verifyAnonymous(verifyData: VerifyRequest): Promise<VerifyResponse> {
    const prevBoard = await this.findById(verifyData.boardId);
    const isPasswordMatch = await bcrypt.compare(verifyData.password, prevBoard.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException("비밀번호 불일치");
    }

    return { boardId: prevBoard.boardId, verify: isPasswordMatch };
  }

  async update(id: number, updateData: UpdateBoard): Promise<BoardDetail> {
    const prevBoard = await this.findById(id);

    if (!prevBoard) {
      throw new Error("글이 존재하지 않습니다.");
    }

    // 수정된 내용 업데이트
    // 회원이면 바로 updateData, 아니면 hash 해줘야함
    if (updateData.password) {
      const encrypt = await this.hashedBoard(updateData.password);
      updateData = {...updateData, password: encrypt};
    }

    Object.assign(prevBoard, updateData);

    const board = await this.boardRepository.save(prevBoard);

    return new BoardDetail(board);
  }

  async markCommentAsRead(boardId: number): Promise<{ boardId }> {
    await this.commentRepository.createQueryBuilder()
      .update(Comment)
      .set({ checked: true })
      .where("boardId = :boardId", { boardId })
      .execute();

    return { boardId };
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.boardRepository.delete(id);
  }
}
