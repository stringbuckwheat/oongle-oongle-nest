import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as process from "process";
import { User } from "../user/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {

  constructor(
    private readonly authService: AuthService,) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY,
      usernameField: "username",
      ignoreExpiration: true,
    });
  }

  async validate(payload: any): Promise<User> {
    console.log("* JwtStrategy - validate");

    // 토큰 만료 여부 검사
    const currentTimestamp = Math.floor(Date.now() / 1000); // 현재 시간의 타임스탬프
    if(payload.exp < currentTimestamp) {
      console.log("토큰 만료");
      throw new UnauthorizedException("토큰 만료");
    }

    const user = await this.authService.validateUser(payload.username);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}