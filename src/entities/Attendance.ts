import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Student } from "./Student";

export enum AttendanceType {
  MEMBER = 'member',
  VISITOR = 'visitor'
}

export enum AttendanceStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'enum', enum: AttendanceType })
  type!: AttendanceType;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.OPEN })
  status!: AttendanceStatus;

  // For members - reference to Student entity
  @Column({ type: 'varchar', nullable: true })
  studentId!: string | null;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student!: Student | null;

  // For visitors - store visitor info directly
  @Column({ type: 'varchar', length: 120, nullable: true })
  visitorName!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  visitorHall!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  visitorLevel!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  visitorPurpose!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  visitorPhone!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  visitorEmail!: string | null;

  @Column({ type: 'boolean', default: true })
  isPresent!: boolean;

  @Column({ type: 'varchar', nullable: true })
  markedBy!: string | null; // User ID who marked the attendance

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}