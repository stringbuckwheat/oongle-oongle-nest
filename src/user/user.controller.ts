import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { AuthGuard } from "@nestjs/passport";
import AuthUser from "../auth/user.decorator";

@Controller("user")
export class UserController {

  constructor(private readonly userService: UserService) {
  }

  // 회원 정보 확인
  @Get("/:userId")
  @UseGuards(AuthGuard("jwt"))
  async getUserByUserId(@Param("userId") userId: number): Promise<Partial<User>> {
    // @UseGuards(AuthGuard('jwt'))로 헤더의 토큰 검증
    // 실제 검증 로직은 JwtStrategy의 validate에 있음
    // AuthUser 데코레이터 코드 작성 후, 인증된 사용자 정보를 @AuthUser를 통해 받음
    const user = await this.userService.findByUserId(userId);
    const { password, ...response } = user;
    return response;
  }

  // 채팅방 추가용 회원 검색
  @Get("/username/:username")
  @UseGuards(AuthGuard("jwt"))
  searchByUsernameExceptMe(@Param("username") username: string, @AuthUser() user): Promise<Partial<User>[]> {
    return this.userService.searchByUsernameExceptMe(username, user);
  }

  // 아이디 중복 검사
  @Post("/username")
  hasSameUsername(@Body() user: Partial<User>): Promise<string> {
    return this.userService.hasSameUsername(user.username);
  }

  // 회원가입
  @Post("")
  register(@Body() user: Partial<User>): Promise<Partial<User>> {
    return this.userService.register(user);
  }

  // 비밀번호 바꾸기 전 비밀번호 확인
  @Post("/:userId/password")
  @UseGuards(AuthGuard("jwt"))
  verifyUserByPassword(@Body() userRequest: { password: string, userId: number }): Promise<{ isPasswordMatch: boolean, message: string }> {
    return this.userService.verifyUserByPassword(userRequest);
  }

  // 비밀번호 변경
  @Put("/:userId/password")
  @UseGuards(AuthGuard("jwt"))
  async changePassword(@Body() userRequest: { password: string, userId: number }): Promise<Partial<User>> {
    return this.userService.changePassword(userRequest);
  }

  // 회원 정보 수정
  @Put("/:userId")
  @UseGuards(AuthGuard("jwt"))
  update(@Body() userRequest: { userId: number, name: string }): Promise<Partial<User>> {
    return this.userService.update(userRequest);
  }

  // 회원 탈퇴
  @Delete("/:userId")
  @UseGuards(AuthGuard("jwt"))
  async delete(@Param("userId") userId: number): Promise<void> {
    return this.userService.delete(userId);
  }
}
