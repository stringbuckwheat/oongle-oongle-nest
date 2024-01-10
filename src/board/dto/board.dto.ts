import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

/**
 * Response용 DTO 공통 속성
 */
export class BoardDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsOptional()
  @IsNumber()
  readonly userId?: number; // nullable

  @IsOptional()
  @IsString()
  readonly name?: string; // nullable

  @IsOptional()
  @IsString()
  readonly password?: string; // nullable
}