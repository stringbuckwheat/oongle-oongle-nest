import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "./board.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>
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

    // 없으면 어떻게 되는지 보기
    if (!post) {
      throw new NotFoundException("글 없음");
    }

    return post;
  }

  async hashedBoard(postData: Partial<Board>): Promise<Partial<Board>> {
    const hashedPassword = await bcrypt.hash(postData.password, 10); // 10 == saltRounds
    return { ...postData, password: hashedPassword };
  }

  async create(postData: Partial<Board>): Promise<Board> {
    // 비밀번호 암호화
    const encrypt = await this.hashedBoard(postData);
    const post = this.boardRepository.create(encrypt);
    return this.boardRepository.save(post);
  }

  async update(id: number, postData: Partial<Board>): Promise<Board> {
    const prevBoard = await this.findById(id);
    const isPasswordMatch = await bcrypt.compare(postData.password, prevBoard.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('비밀번호 불일치');
    }

    // 아직 야매 API라 비번 변경 불가ㅋㅋㅋ
    const encrypt = await this.hashedBoard(postData);
    const updateResult = await this.boardRepository.update(id, encrypt);
    // console.log("updateResult", updateResult); -- raw, affected... 이런 거 알려줌

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id); // Check if board exists
    await this.boardRepository.delete(id);
  }
}
