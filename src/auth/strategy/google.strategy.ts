import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import * as process from "process";
import { Response } from "express"; // 이걸 써야 response 보낼 수 있음


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private readonly authService: AuthService
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
      scope: ["profile", "email"]
    });
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    console.log("GoogleStrategy -- validate");

    try {
      const user = await this.authService.validateOAuthLogin(profile);
      done(null, user);
    } catch (e) {
      done(e, false);
    }
  }
}