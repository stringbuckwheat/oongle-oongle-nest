import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("user")
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ length: 50, nullable: false })
  username: string;

  @Column({ length: 50, nullable: false })
  name: string;

  @Column({ length: 100, nullable: false })
  password: string;
}