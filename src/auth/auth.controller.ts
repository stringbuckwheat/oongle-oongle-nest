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

  @Get("/user/:id/alarm")
  @UseGuards(AuthGuard("jwt"))
  async getAlarm(@Param("id") userId): Promise<CommentCreatedAlarm[]> {
    return this.authService.getAlarm(userId);
  }
}
