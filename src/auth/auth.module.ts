import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { UserService } from "../user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Comment } from "../comment/comment.entity";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: "1h" } // 토큰 만료 시간
    }),
    TypeOrmModule.forFeature(
      [User]
    ),
    TypeOrmModule.forFeature(
      [Comment]
    )
  ],
  providers: [AuthService, JwtStrategy, UserService,],
  exports: [AuthService],
  controllers: [AuthController]
})

export class AuthModule {
}
