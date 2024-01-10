import { Comment } from "../../comment/comment.entity";

export class CommentCreatedAlarm {
  readonly userId: number;
  readonly boardId: number;
  readonly title: string;
  readonly commentId: number;
  readonly content: string;
  readonly createdAt: Date;
  readonly message: string;

  constructor(comment: Comment) {
    this.userId = comment.user?.userId;
    this.boardId = comment.board.boardId;
    this.title = comment.board.title;
    this.commentId = comment.commentId;
    this.content = comment.content;
    this.createdAt = comment.createdAt;
    this.message = "새로운 댓글이 작성되었습니다!";
  }
}