import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginDto } from "./dto/login.dto";
import { User } from "../user/user.entity";
import { AuthUser } from "./dto/authUser.dto";
import { UserChatRoom } from "../chat/entity/user-chat-room.entity";
import { AlarmService } from "../alarm/alarm.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly alarmService: AlarmService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
  }

  async validateUser(username: string): Promise<User> {
    return await this.userService.findByUsername(username);
  }

  async findByUserId(userId: number): Promise<User> {
    return await this.userService.findByUserId(userId);
  }

  async login(loginDto: LoginDto): Promise<AuthUser> {
    // DB 검증 로직
    const user = await this.userService.findByUsername(loginDto.username);

    // ID, PW 검사
    if (!user || !bcrypt.compare(loginDto.password, user.password)) {
      console.log(!user ? "그런 사용자 없음" : "비번 틀림");
      throw new UnauthorizedException();
    }

    // JWT access token, 기본 사용자 정보
    return {
      accessToken: this.getAccessToken(user.userId),
      userId: user.userId,
      username: user.username,
      name: user.name,
      alarms: await this.alarmService.getAlarms(user.userId)
    };
  }

  async validateOAuthLogin(profile: any): Promise<any> {
    console.log("DB 로직 추가");

    // profile 가공
    const email = profile.emails ? profile.emails[0].value : null;
    const provider = profile.provider;
    const name = profile.displayName;

    console.log("email(provider) - name: ", `${email}(${provider}) - ${name}`);

    // DB에서 사용자 검색
    let user = await this.userRepository.findOne({
      where: { provider, email },
    });

    if (user) {
      // 가입된 회원이면 업데이트
      console.log("가입된 회원");
      user.name = name;
      user = await this.userRepository.save(user);
    } else {
      // 가입되지 않은 회원이면 새로 생성
      console.log("신규 회원");
      user = await this.userRepository.save({ email, provider, name });
    }

    const userId = user.userId;

    return {
      accessToken: this.getAccessToken(userId),
      userId,
      name: user.name,
    };
  }

  private getAccessToken(userId: number): string {
    const payload = { sub: userId, iss: "nest-board", aud: "api-server" };
    return this.jwtService.sign(payload);
  }
}
