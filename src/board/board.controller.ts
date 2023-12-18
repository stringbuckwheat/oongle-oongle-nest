import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { BoardService } from "./board.service";
import { Board } from "./board.entity";

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {
  }

  @Get()
  getAll(): Promise<Board[]> {
    return this.boardService.findAll()
  }

  @Get("/:id")
  getOne(@Param("id") id: number): Promise<Board> {
    return this.boardService.findById(id);
  }

  @Post()
  async create(@Body() postData): Promise<number>{
    return (await this.boardService.create(postData)).boardId;
  }

  @Put("/:id")
  update(@Param("id") id: number, @Body() updateData) : Promise<Board> {
    return this.boardService.update(id, updateData);
  }

  @Delete("/:id")
  remove(@Param("id") id: number){
    return this.boardService.delete(id);
  }

  // @Get("/search")
  // search(@Query("year") searchingYear: number) {
  //   // id보다 밑에 있으면 'search'가 id라고 생각함...
  //   // search?year=2000
  //   return `we are searching a movie year: ${searchingYear}`;
  // }

}
