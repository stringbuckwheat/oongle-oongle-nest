import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as process from "process";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY,
      usernameField: 'username',
    });
  }

  async validate(payload: any): Promise<any> {
    const user = await this.authService.validateUser(payload);

    if(!user){
      throw new UnauthorizedException();
    }

    return user;
  }
}