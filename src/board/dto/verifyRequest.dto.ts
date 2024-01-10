import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class VerifyRequest {
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @IsNumber()
  @IsNumber()
  readonly boardId: number;
}