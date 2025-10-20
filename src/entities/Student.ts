import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export type StudentRole = "Member" | "Visitor";

@Entity({ name: "students" })
export class Student {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ type: "varchar", length: 20, unique: true, nullable: true }) code!: string | null; // STU-YYYY-XXX
  @Column({ type: "varchar", length: 120 }) fullName!: string;
  @Column({ type: "varchar", length: 10 }) gender!: string;
  @Column({ type: "varchar", length: 10 }) level!: string; // e.g., L100
  @Column({ type: "varchar", length: 120, nullable: true }) programOfStudy!: string | null;
  @Column({ type: "int" }) programDurationYears!: number;
  @Column({ type: "int", nullable: true }) expectedCompletionYear!: number | null;
  @Column({ type: "varchar", length: 80 }) hall!: string;
  @Column({ type: "varchar", length: 10 }) role!: StudentRole;
  @Column({ type: "date" }) dateOfAdmission!: string;
  @Column({ type: "date", nullable: true }) dateOfBirth!: string | null;
  @Column({ type: "varchar", length: 180, nullable: true }) residence!: string | null;
  @Column({ type: "varchar", length: 120, nullable: true }) guardianName!: string | null;
  @Column({ type: "varchar", length: 30, nullable: true }) guardianContact!: string | null;
  @Column({ type: "varchar", length: 120, nullable: true }) localChurchName!: string | null;
  @Column({ type: "varchar", length: 180, nullable: true }) localChurchLocation!: string | null;
  @Column({ type: "varchar", length: 120, nullable: true }) district!: string | null;
  @Column({ type: "varchar", length: 30, nullable: true }) phone!: string | null;
  @Column({ type: "varchar", length: 180, nullable: true }) email!: string | null;
  @Column({ type: "text", nullable: true }) profileImageUrl!: string | null;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
