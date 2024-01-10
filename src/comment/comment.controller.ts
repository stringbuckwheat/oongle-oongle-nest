import { Body, Controller, Delete, Param, Post, Put, UseGuards } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CommentResponseDto } from "./dto/commentResponse.dto";
import { CommentRequest } from "./dto/commentRequest.dto";

@Controller("comment")
export class CommentController {
  constructor(
    private readonly commentService: CommentService
  ) {
  }

  @Post()
  async create(@Body() commentData: CommentRequest): Promise<CommentResponseDto> {
    return this.commentService.create(commentData);
  }

  @Post(":id/verify")
  async verify(@Body() verifyData: { password: string, commentId: number }): Promise<{ commentId: number, verify: boolean }> {
    return this.commentService.verify(verifyData);
  }

  @Delete(":id")
  async delete(@Param("id") commentId: number): Promise<void> {
    return this.commentService.delete(commentId);
  }
}
