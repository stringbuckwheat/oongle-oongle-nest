// 유효성 검사
import { PartialType } from "@nestjs/mapped-types";
import { CreateMovieDto } from "./create-movie.dto";

/**
 * 전부 필수사항이 아니라는 것만 빼면 CreateMovieDto와 같음
 */
export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
