export class CommentDto {
  readonly commentId: number;
  readonly content: string;
  readonly createdAt: string;
  readonly name: string;
  readonly userId: number;
  readonly replies: CommentDto[];
}