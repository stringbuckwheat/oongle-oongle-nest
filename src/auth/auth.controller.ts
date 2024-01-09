import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() req) {
    return this.authService.login(req);
  }

  @Get('/user/:id/alarm')
  @UseGuards(AuthGuard("jwt"))
  async getAlarm(@Param("id") userId) {
    return this.authService.getAlarm(userId);
  }
}
