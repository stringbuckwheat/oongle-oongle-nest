import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { AuthGuard } from "@nestjs/passport";
import AuthUser from "../auth/user.decorator";

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {
  }

  @Post('/username')
    hasSameUsername(@Body() user: Partial<User>): Promise<string> {
    return this.userService.hasSameUsername(user.username);
  }

  // 회원가입
  @Post("")
  register(@Body() user: Partial<User>): Promise<Partial<User>> {
    console.log("user", user);
    return this.userService.register(user);
  }

  // 회원 정보 확인
  @Get("/:userId")
  @UseGuards(AuthGuard('jwt'))
  getUserByUserId(@Param("userId") userId: number, @AuthUser() user): Promise<Partial<User>> {
    // @UseGuards(AuthGuard('jwt'))로 헤더의 토큰 검증
    // 실제 검증 로직은 JwtStrategy의 validate에 있음
    // AuthUser 데코레이터 코드 작성 후, 인증된 사용자 정보를 @AuthUser를 통해 받음
    console.log("getUserByUserId")
    const { password, ...response } = user;
    return response;
  }

  // 채팅방 추가용
  @Get("/username/:username")
  @UseGuards(AuthGuard('jwt'))
  async searchByUsernameExceptMe(@Param("username") username: string, @AuthUser() user): Promise<Partial<User>[]> {
    console.log("getUserByUsername getUserByUsername getUserByUsername")
    return await this.userService.searchByUsernameExceptMe(username, user);
  }
}
