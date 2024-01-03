import { Body, Controller, Post } from "@nestjs/common";
import { LikeService } from "./like.service";

@Controller('/board/:boardId/like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {
  }

  @Post("")
  async like(@Body() postLike): Promise<number>{
    return await this.likeService.like(postLike);
  }
}
