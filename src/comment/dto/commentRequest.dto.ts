import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CommentRequest {
  @IsOptional()
  @IsNumber()
  readonly commentId: number;

  @IsOptional()
  @IsNumber()
  readonly userId: number;

  @IsNotEmpty()
  @IsNumber()
  readonly boardId: number;

  @IsNotEmpty()
  @IsString()
  readonly content: string;

  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly password: string;
}