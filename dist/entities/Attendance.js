"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attendance = exports.AttendanceStatus = exports.AttendanceType = void 0;
const typeorm_1 = require("typeorm");
const Student_1 = require("./Student");
var AttendanceType;
(function (AttendanceType) {
    AttendanceType["MEMBER"] = "member";
    AttendanceType["VISITOR"] = "visitor";
})(AttendanceType || (exports.AttendanceType = AttendanceType = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["OPEN"] = "open";
    AttendanceStatus["CLOSED"] = "closed";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
let Attendance = class Attendance {
};
exports.Attendance = Attendance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Attendance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Attendance.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AttendanceType }),
    __metadata("design:type", String)
], Attendance.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.OPEN }),
    __metadata("design:type", String)
], Attendance.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Student_1.Student, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", Object)
], Attendance.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "visitorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 80, nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "visitorHall", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "visitorLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "visitorPurpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "visitorPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 180, nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "visitorEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Attendance.prototype, "isPresent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Attendance.prototype, "markedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Attendance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Attendance.prototype, "updatedAt", void 0);
exports.Attendance = Attendance = __decorate([
    (0, typeorm_1.Entity)('attendance')
], Attendance);
