import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { BoardService } from "./board.service";
import { BoardList } from "./dto/boardList.dto";
import { BoardDetail } from "./dto/detail.dto";
import { AuthGuard } from "@nestjs/passport";
import { VerifyResponse } from "./dto/verifyResponse.dto";
import { VerifyRequest } from "./dto/verifyRequest.dto";
import { UpdateBoard } from "./dto/update.dto";
import { BoardDto } from "./dto/board.dto";

@Controller("board")
export class BoardController {
  constructor(private readonly boardService: BoardService) {
  }

  @Get()
  getAll(): Promise<BoardList[]> {
    return this.boardService.findAll();
  }

  @Get("/popular")
  getPopular(): Promise<BoardList[]> {
    return this.boardService.getPopular();
  }

  @Get("/:id")
  getOne(@Param("id") id: number): Promise<BoardDetail> {
    return this.boardService.getDetail(id);
  }

  @Post()
  async create(@Body() postData: BoardDto): Promise<number> {
    return (await this.boardService.create(postData)).boardId;
  }

  @Post("/:id/verify")
  async verifyAnonymous(@Body() verifyData: VerifyRequest): Promise<VerifyResponse> {
    return await this.boardService.verifyAnonymous(verifyData);
  }

  @Put("/:id")
  update(@Param("id") id: number, @Body() updateData: UpdateBoard): Promise<BoardDetail> {
    return this.boardService.update(id, updateData);
  }

  @Put(":id/comment")
  @UseGuards(AuthGuard("jwt"))
  async markCommentAsRead(@Param("id") boardId: number): Promise<{ boardId }> {
    return this.boardService.markCommentAsRead(boardId);
  }

  @Delete("/:id")
  remove(@Param("id") id: number) {
    return this.boardService.delete(id);
  }
}
