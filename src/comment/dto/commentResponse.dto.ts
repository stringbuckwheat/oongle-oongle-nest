import { Comment } from "../comment.entity";

export class CommentResponseDto {
  readonly commentId: number;
  readonly content: string;
  readonly createdAt: string;
  readonly name: string;
  readonly userId: number;
  readonly replies: CommentResponseDto[];

  constructor(comment: Comment) {
    this.commentId = comment.commentId;
    this.content = comment.content;
    this.name = comment.name ? comment.name : comment.user.name;
    this.userId = comment.name ? null : comment.user?.userId ?? null;
    this.createdAt = this.transformCreateDate(comment.createdAt);
    this.replies = comment.replies?.map(reply => new CommentResponseDto(reply)) ?? [];
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
}