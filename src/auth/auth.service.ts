import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(payload: any): Promise<any> {
    return await this.userService.findByUsername(payload.username);
  }

  async login(req: any): Promise<any> {
    // DB 검증 로직
    const user = await this.userService.findByUsername(req.username);

    // ID, PW 검사
    if(!user || !bcrypt.compare(req.password, user.password)){
      throw new UnauthorizedException();
    }

    const payload = {sub: user.userId, iss: "nest-board", aud: "api-server"};

    // JWT access token, 기본 사용자 정보
    // TODO 작성 글, 댓글 개수 등 추가해주기
    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.userId,
      name: user.username
    }
  }
}
