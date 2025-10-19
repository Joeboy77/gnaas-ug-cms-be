import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export type UserRole = "SUPER_ADMIN" | "SECRETARY";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120 })
  fullName!: string;

  @Column({ type: "varchar", length: 180, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  level!: string | null;

  @Column({ type: "int", nullable: true })
  programDurationYears!: number | null;

  @Column({ type: "varchar", length: 80, nullable: true })
  hall!: string | null;

  @Column({ type: "varchar", length: 20 })
  role!: UserRole;

  @Column({ type: "date", nullable: true })
  dateOfAdmission!: string | null;

  @Column({ type: "varchar", length: 30, nullable: true })
  phone!: string | null;

  @Column({ type: "text", nullable: true })
  profileImageUrl!: string | null;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
