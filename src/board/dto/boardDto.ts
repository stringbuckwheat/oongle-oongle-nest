import { Expose, Transform } from "class-transformer";

export class BoardDto {
  @Expose()
  readonly boardId: number;

  @Expose()
  readonly title: string;

  @Expose()
  readonly name: string;
  @Expose()
  readonly memberId: number;

  @Expose()
  readonly isMember: boolean;

  readonly createdAt: string;

  @Expose()
  readonly hits: number;
  @Expose()
  readonly likes: number;
}