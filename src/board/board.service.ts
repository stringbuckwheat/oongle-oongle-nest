import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "./board.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../user/entities/user.entity";

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepostiory: Repository<User>
  ) {
  }

  async findAll(): Promise<Board[]> {
    return this.boardRepository.find();
  }

  async findById(postId: number): Promise<Board> {
    // 희한하네
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

  async hashedBoard(postData: Partial<Board>): Promise<Partial<Board>> {
    const hashedPassword = await bcrypt.hash(postData.password, 10); // 10 == saltRounds
    return { ...postData, password: hashedPassword };
  }

  async create(postData): Promise<Board> {
    // 비회원일 경우
    if(postData.password){
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
    })

    const board = this.boardRepository.create({
      user,
      title: postData.title,
      content: postData.content,
    });

    return this.boardRepository.save(board);
  }

  async update(id: number, postData: Partial<Board>): Promise<Board> {
    const prevBoard = await this.findById(id);
    const isPasswordMatch = await bcrypt.compare(postData.password, prevBoard.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('비밀번호 불일치');
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
