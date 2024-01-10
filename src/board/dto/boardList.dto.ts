import { Expose } from "class-transformer";
import { Board } from "../board.entity";

export class BoardList {
  readonly boardId: number;

  @Expose()
  readonly title: string;

  @Expose()
  readonly name: string;
  @Expose()
  readonly userId: number;

  @Expose()
  readonly isMember: boolean;

  readonly createdAt: string;

  @Expose()
  readonly hits: number;
  @Expose()
  readonly likes: number;

  constructor(board: Board) {
    this.boardId = board.boardId;
    this.title = board.title;
    this.name = board.name ?? board.user?.name ?? "";
    this.userId = board.name ? null : board.user?.userId ?? null;
    this.isMember = board.name == null;
    this.createdAt = this.transformCreateDate(board.createdAt); // 오늘이면 시간, 아니면 날짜
    this.hits = board.hits;
    this.likes = board.likes?.length ?? 0;
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