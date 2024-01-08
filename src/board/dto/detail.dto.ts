import { CommentDto } from "../../comment/dto/comment.dto";

export class BoardDetail {
  readonly boardId: number;
  readonly title: string;
  readonly name: string;
  readonly memberId: number;
  readonly isMember: boolean;
  readonly content: string;
  readonly createdAt: string;
  readonly hits: number;
  readonly likes: number;
  readonly comments: CommentDto[];
}