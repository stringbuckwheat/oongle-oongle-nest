import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Comment } from "../comment/comment.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AlarmDto } from "../alarm/alarm.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {
  }

  async validateUser(payload: any): Promise<any> {
    return await this.userService.findByUsername(payload.username);
  }

  async login(req: any): Promise<any> {
    // DB 검증 로직
    const user = await this.userService.findByUsername(req.username);
    console.log("user", user);

    // ID, PW 검사
    if (!user || !bcrypt.compare(req.password, user.password)) {
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

  async getAlarm(userId: number): Promise<AlarmDto[]> {
    console.log("==== userId", userId);
    // 사용자 알림
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

    return unCheckedComments.map((comment) => ({
      userId: comment.user?.userId,
      boardId: comment.board.boardId,
      title: comment.board.title,
      commentId: comment.commentId,
      content: comment.content,
      createdAt: comment.createdAt,
      message: "새로운 댓글이 작성되었습니다!"
    }))
  }
}
