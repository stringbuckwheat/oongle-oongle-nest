import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { AuthUser } from "../auth/dto/authUser.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
  }

  // 아이디 중복 검사
  async hasSameUsername(inputUsername: string): Promise<string> {
    const user = await this.findByUsername(inputUsername);
    return user?.username || null;
  }

  // 회원가입
  async register(user: Partial<User>): Promise<Partial<User>> {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const savedUser = await this.userRepository.save({
      ...user,
      password: hashedPassword
    });

    const { password, ...response } = savedUser;
    return response;
  }

  // username으로 회원 조회
  async findByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        username
      }
    });
  }

  // User PK로 회원 조회
  async findByUserId(userId: number): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        userId
      }
    });
  }

  // username으로 회원 검색
  // 내가 아닌 사람 중에서 WHERE username LIKE %username%
  async searchByUsernameExceptMe(username: string, user: AuthUser): Promise<Partial<User>[]> {
    const users = await this.userRepository.createQueryBuilder("user")
      .where("username LIKE :username", { username: `%${username}%` })
      .andWhere("username != :myUsername", { myUsername: user.username })
      .getMany();

    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  // 회원 정보 수정
  async update(userRequest: { name: string, userId: number }): Promise<Partial<User>> {
    const prevUser = await this.findByUserId(userRequest.userId);

    if (!prevUser) {
      throw new NotFoundException("그런 회원 없음");
    }

    const user = await this.userRepository.save({ ...prevUser, name: userRequest.name });
    const { password, ...result } = user;

    return result;
  }

  // 비밀번호 확인
  async verifyUserByPassword(userRequest: { password: string, userId: number }): Promise<{ isPasswordMatch: boolean, message: string }> {
    const user = await this.findByUserId(userRequest.userId);
    // raw, encrypt 순
    const isPasswordMatch = await bcrypt.compare(userRequest.password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException("비밀번호 틀림");
    }

    return { isPasswordMatch, message: "비밀번호 확인 완료!" };
  }

  // 비밀번호 바꾸기
  async changePassword(userRequest: { password: string, userId: number }): Promise<Partial<User>> {
    // 비밀번호 암호화
    const encrypt = await bcrypt.hash(userRequest.password, 10);

    const prevUser = await this.findByUserId(userRequest.userId);
    const user = await this.userRepository.save({ ...prevUser, password: encrypt });

    const { password, ...result } = user;

    return result;
  }

  // 탈퇴
  async delete(userId: number): Promise<void> {
    await this.findByUserId(userId);
    await this.userRepository.delete(userId);
  }
}
