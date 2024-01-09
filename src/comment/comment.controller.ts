import { Body, Controller, Delete, Param, Post, Put, UseGuards } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CommentDto } from "./dto/comment.dto";

@Controller("comment")
export class CommentController {
  constructor(
    private readonly commentService: CommentService
  ) {
  }

  @Post()
  async create(@Body() commentData): Promise<CommentDto> {
    console.log("commentData", commentData);
    return this.commentService.create(commentData);
  }

  @Post(":id/verify")
  async verify(@Body() verifyData): Promise<any> {
    return this.commentService.verify(verifyData);
  }

  @Delete(":id")
  async delete(@Param("id") commentId: number): Promise<void> {
    return this.commentService.delete(commentId);
  }
}
