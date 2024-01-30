import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ length: 50, nullable: true })
  username: string;

  @Column({ length: 50, nullable: false })
  name: string;

  @Column({ length: 100, nullable: true })
  password: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  provider: string;
}