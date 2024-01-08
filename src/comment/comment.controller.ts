import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { Comment } from "./comment.entity";
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

  @Put(":id")
  async update(@Param("id") commentId: number, @Body() updateData: Partial<Comment>): Promise<Comment> {
    return this.commentService.update(commentId, updateData);
  }

  @Delete(":id")
  async delete(@Param("id") commentId: number): Promise<void> {
    return this.commentService.delete(commentId);
  }
}
