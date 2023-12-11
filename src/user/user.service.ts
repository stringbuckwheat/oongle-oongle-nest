import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
  }

  // 아이디 중복 검사
  async hasSameUsername(inputUsername: string): Promise<string> {
    const user = await this.userRepository.findOne({
      where: {
        username: inputUsername
      }
    });

    return user?.username || null;
  }

  // 회원가입
  async register(user: Partial<User>): Promise<Partial<User>> {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const savedUser = await this.userRepository.save({
      ...user,
      password: hashedPassword,
    });

    const { password, ...response } = savedUser;
    return response;
  }

  // 회원 정보 확인


  // 회원 정보 수정
  // 수정 전 비밀번호 확인
  // async verifyUser(rawPassword: string): Promise<>

  // 회원 정보 수정

  // 탈퇴
}
