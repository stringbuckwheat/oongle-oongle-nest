import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { CommentCreatedAlarm } from "../alarm/dto/commentCreatedAlarm.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthUser } from "./dto/authUser.dto";

@Controller("")
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post("/login")
  async login(@Body() loginDto: LoginDto): Promise<AuthUser> {
    return this.authService.login(loginDto);
  }

  @Get("/user/:id/alarm/comment")
  @UseGuards(AuthGuard("jwt"))
  async getCommentAlarm(@Param("id") userId): Promise<any> {
    return this.authService.getCommentAlarm(userId);
  }

  @Get("/user/:id/alarm/chat")
  @UseGuards(AuthGuard("jwt"))
  async getChatAlarm(@Param("id") userId): Promise<any> {
    return this.authService.getUnReadMessage(userId);
  }
}
