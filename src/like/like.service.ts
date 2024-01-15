import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like } from "./like.entity";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { Board } from "../board/board.entity";

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>
  ) {
  }

  async like(postLike): Promise<number> {
    const { userId, boardId } = postLike;

    // 사용자와 게시글이 존재하는지 확인
    const [user, board] = await Promise.all([
      this.userRepository.findOne({ where: { userId } }),
      this.boardRepository.findOne({ where: { boardId } })
    ]);

    if (!user || !board) {
      throw new NotFoundException("사용자나 게시글 없음");
    }

    // 좋아요 여부 확인
    const hasLiked = await this.likeRepository.findOne({
      where: { user: { userId }, board: { boardId } }
    });

    if (hasLiked) {
      // 좋아요 취소
      await this.likeRepository.remove(hasLiked);
    } else {
      // 좋아요 저장
      const like = new Like();
      like.user = user;
      like.board = board;
      await this.likeRepository.save(like);
    }

    // 해당 게시글이 받은 좋아요 개수 조회
    return await this.likeRepository.count({ where: { board: { boardId } } });
  }
}
