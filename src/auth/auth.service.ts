import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Comment } from "../comment/comment.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentCreatedAlarm } from "../alarm/dto/commentCreatedAlarm.dto";
import { LoginDto } from "./dto/login.dto";
import { User } from "../user/user.entity";
import { AuthUser } from "./dto/authUser.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {
  }

  async validateUser(username: string): Promise<User> {
    return await this.userService.findByUsername(username);
  }

  async login(loginDto: LoginDto): Promise<AuthUser> {
    // DB 검증 로직
    const user = await this.userService.findByUsername(loginDto.username);
    console.log("user", user);

    // ID, PW 검사
    if (!user || !bcrypt.compare(loginDto.password, user.password)) {
      throw new UnauthorizedException();
    }

    // access token payload
    const payload = { sub: user.userId, iss: "nest-board", aud: "api-server" };

    // JWT access token, 기본 사용자 정보
    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.userId,
      name: user.username,
      alarms: await this.getAlarm(user.userId)
    };
  }

  // 사용자 알림
  async getAlarm(userId: number): Promise<CommentCreatedAlarm[]> {
    const unCheckedComments = await this.commentRepository.find({
      where: {
        board: {
          user: { userId } // 본인이 작성한 글
        },
        checked: false // 확인하지 않은 댓글만
      },
      order: {
        createdAt: "DESC"
      },
      relations: ["user", "board"]
    });

    return unCheckedComments.map((comment) => (new CommentCreatedAlarm(comment)));
  }
}
