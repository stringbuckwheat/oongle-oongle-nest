import { CommentResponseDto } from "../../comment/dto/commentResponse.dto";
import { Board } from "../board.entity";

export class BoardDetail {
  readonly boardId: number;
  readonly title: string;
  readonly name: string;
  readonly userId: number;
  readonly isMember: boolean;
  readonly content: string;
  readonly createdAt: string;
  readonly hits: number;
  readonly likes: number;
  readonly comments: CommentResponseDto[];

  constructor(board: Board) {
    this.boardId = board.boardId;
    this.title = board.title;
    this.name = board.name ?? board.user?.name ?? "";
    this.userId = board.name ? null : board.user?.userId ?? null;
    this.isMember = board.name == null;
    this.createdAt = board.createdAt.toISOString().replace("T", " ").split(".")[0];
    this.hits = board.hits;
    this.likes = board.likes?.length ?? 0;

    this.content = board.content;
    this.comments = board.comments.map(comment => new CommentResponseDto(comment));
  }
}