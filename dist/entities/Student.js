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
exports.Student = void 0;
const typeorm_1 = require("typeorm");
let Student = class Student {
};
exports.Student = Student;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Student.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, unique: true, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 120 }),
    __metadata("design:type", String)
], Student.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], Student.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], Student.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 120, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "programOfStudy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Student.prototype, "programDurationYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "expectedCompletionYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 80 }),
    __metadata("design:type", String)
], Student.prototype, "hall", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], Student.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Student.prototype, "dateOfAdmission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 180, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "residence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 120, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "guardianName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "guardianContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 120, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "localChurchName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 180, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "localChurchLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 120, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 180, nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], Student.prototype, "profileImageUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Student.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Student.prototype, "updatedAt", void 0);
exports.Student = Student = __decorate([
    (0, typeorm_1.Entity)({ name: "students" })
], Student);
