import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { UserService } from "../user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { Comment } from "../comment/comment.entity";
import { GoogleStrategy } from "./strategy/google.strategy";
import { AlarmService } from "../alarm/alarm.service";
import { UserMessageRead } from "../chat/entity/user-message-read.entity";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: "1h" } // 토큰 만료 시간
    }),
    TypeOrmModule.forFeature(
      [User, Comment, UserMessageRead]
    ),
    PassportModule.register({ defaultStrategy: 'jwt' }), // 기본 전략 설정
  ],
  providers: [AuthService, JwtStrategy, UserService, GoogleStrategy, AlarmService],
  exports: [AuthService],
  controllers: [AuthController]
})

export class AuthModule {}
