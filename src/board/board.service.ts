import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "./board.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../user/entities/user.entity";
import { RecentDto } from "./dto/recent.dto";
import { BoardDetail } from "./dto/detail.dto";

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepostiory: Repository<User>,
  ) {
  }

  async findAll(): Promise<RecentDto[]> {
    const boards = await this.boardRepository.createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'user') // 'user'는 연결된 엔티티의 별칭입니다.
      .leftJoinAndSelect('board.likes', 'likes')
      .orderBy('board.createdAt', 'DESC')
      .take(10)
      .getMany();

    const recentDtos = boards.map(board => this.mapBoardToRecentDto(board));

    return recentDtos;
  }

  private mapBoardToRecentDto(board: Board): RecentDto {
    return ({
      boardId: board.boardId,
      title: board.title,
      name: board.name ?? board.user?.name ?? '',
      memberId: board.name ? null : board.user?.userId ?? null,
      isMember: board.name == null,
      createdAt: this.transformCreateDate(board.createdAt), // 오늘이면 시간, 아니면 날짜
      hits: board.hits,
      likes: board.likes?.length ?? 0
    })
  }

  private transformCreateDate(date: Date): string {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // 오늘 날짜면
    if(date.toISOString().split("T")[0] === today){
      // 시:분으로 가공
      return date.toISOString().split("T")[1].substring(0, 5);
    }

    // 오늘 날짜가 아니면 해당 날짜 리턴
    return date.toISOString().split("T")[0];
  }

  async findById(postId: number): Promise<Board> {
    const post = await this.boardRepository.findOne({
      where: {
        boardId: postId
      }
    });

    if (!post) {
      throw new NotFoundException("글 없음");
    }

    return post;
  }

  async getDetail(postId: number): Promise<BoardDetail> {
    const board = await this.boardRepository.findOne({
      where: {
        boardId: postId
      },
      relations: ['user', 'likes'] // join
    });

    // 조회수 업데이트
    await this.boardRepository.update(postId, { hits: board.hits + 1 });

    // DTO Return
    return {
      boardId: board.boardId,
      title: board.title,
      name: board.name ?? board.user?.name ?? '',
      memberId: board.name ? null : board.user?.userId ?? null,
      isMember: board.name == null,
      createdAt: board.createdAt.toISOString().replace("T", " ").split(".")[0], // 오늘이면 시간, 아니면 날짜
      hits: board.hits,
      likes: board.likes?.length ?? 0,

      content: board.content,
      // 이후 댓글 데이터 추가
    }
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
      const post = this.boardRepository.create(encrypt);
      return this.boardRepository.save(post);
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

  async update(id: number, postData: Partial<Board>): Promise<Board> {
    const prevBoard = await this.findById(id);
    const isPasswordMatch = await bcrypt.compare(postData.password, prevBoard.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException("비밀번호 불일치");
    }

    // 아직 비번 변경 불가ㅋㅋㅋ
    const encrypt = await this.hashedBoard(postData);
    const updateResult = await this.boardRepository.update(id, encrypt);

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id); // Check if board exists
    await this.boardRepository.delete(id);
  }
}
