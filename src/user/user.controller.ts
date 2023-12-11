import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";

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
}
