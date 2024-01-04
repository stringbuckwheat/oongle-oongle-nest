import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { LikeService } from "./like.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('/board/:boardId/like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {
  }

  @UseGuards(AuthGuard('jwt'))
  @Post("")
  async like(@Body() postLike): Promise<number>{
    return await this.likeService.like(postLike);
  }
}
