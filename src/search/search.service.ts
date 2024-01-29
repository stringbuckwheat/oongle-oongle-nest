import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "../board/board.entity";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { Comment } from "../comment/comment.entity";

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepostiory: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {
  }

  async search(query: string): Promise<any> {
    // 게시글 검색
    const boards = await this.boardRepository.createQueryBuilder("board")
      .leftJoinAndSelect("board.user", "user")
      .where("title LIKE :query", { query: `%${query}%` })
      .orWhere("content LIKE :query", { query: `%${query}%` })
      .orWhere("name LIKE :query", { query: `%${query}%` })
      .orWhere("user.name LIKE :query", { query: `%${query}%` })
      .orWhere("user.username LIKE :query", { query: `%${query}%` })
      .getMany();

    // Comment 검색
    const comments = await this.commentRepository.createQueryBuilder("comment")
      .leftJoinAndSelect("comment.user", "user")
      .where("user.username LIKE :query", { query: `%${query}%` })
      .orWhere("user.name LIKE :query", { query: `%${query}%` })
      .orWhere("name LIKE :query", { query: `%${query}%` })
      .orWhere("content LIKE :query", { query: `%${query}%` })
      .getMany();


    // 유저 검색
    const users = await this.userRepostiory.createQueryBuilder("user")
      .where("username LIKE :query", { query: `%${query}%` })
      .orWhere("name LIKE :query", { query: `%${query}%` })
      .getMany();

    // DTO 변환
    return {
      boards: boards.map((board) => (
        {
          boardId: board.boardId,
          title: board.title,
          content: board.content,
          name: board.name ?? board.user?.name ?? "",
          username: board.user.username ?? ""
        }
      )),

      comments: comments.map((comment) => (
        {
          commentId: comment.commentId,
          content: comment.content,
          name: comment.name ?? comment.user?.name ?? "",
          username: comment.user.username ?? ""
        }
      )),

      users: users.map((user) => {
        const { password, ...result } = user;
        return result;
      })
    };
  }
}
