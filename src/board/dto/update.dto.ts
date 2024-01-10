// update request
import { IsNotEmpty, IsNumber,} from "class-validator";
import { BoardDto } from "./board.dto";

export class UpdateBoard extends BoardDto{
  @IsNumber()
  @IsNotEmpty()
  readonly boardId: number;
}