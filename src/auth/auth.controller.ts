import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
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

  @Get()
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() req) {}

  @Post("/auth/google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req) {
    const user = req.user;
    return user;
  }
}
