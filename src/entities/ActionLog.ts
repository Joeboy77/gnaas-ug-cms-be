import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export type ActionType =
  | "BULK_UPLOAD_STUDENTS"
  | "PROMOTE_STUDENTS"
  | "MARK_ALL_ATTENDANCE"
  | "MARK_INDIVIDUAL_ATTENDANCE";

@Entity({ name: "action_logs" })
export class ActionLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 40 })
  actionType!: ActionType;

  @Column({ type: "uuid" })
  performerUserId!: string;

  // Arbitrary metadata to describe the action (e.g., list of created IDs)
  @Column({ type: "jsonb" })
  metadata!: Record<string, any>;

  // Whether this action has been undone already
  @Column({ type: "boolean", default: false })
  undone!: boolean;

  // Optional space to store payloads needed to undo/redo precisely
  @Column({ type: "jsonb", nullable: true })
  undoData!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
