"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudent = createStudent;
exports.nextStudentCode = nextStudentCode;
exports.listStudents = listStudents;
exports.updateStudent = updateStudent;
exports.deleteStudent = deleteStudent;
const data_source_1 = require("../data-source");
const Student_1 = require("../entities/Student");
const mailjet_1 = require("../mail/mailjet");
const LOGO_URL = "https://i.postimg.cc/fbYRk0dM/gnaasug.png";
async function createStudent(req, res) {
    try {
        const body = req.body || {};
        const repo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const year = new Date().getFullYear();
        const existingThisYear = await repo.createQueryBuilder('s')
            .where('s.code LIKE :prefix', { prefix: `STU-${year}-%` })
            .getCount();
        const code = `STU-${year}-${String(existingThisYear + 1).padStart(3, '0')}`;
        const student = repo.create({
            code,
            fullName: body.fullName,
            gender: body.gender,
            level: body.level,
            programOfStudy: body.programOfStudy ?? null,
            programDurationYears: body.programDurationYears,
            expectedCompletionYear: body.expectedCompletionYear ?? null,
            hall: body.hall,
            role: body.role,
            dateOfAdmission: body.dateOfAdmission,
            dateOfBirth: body.dateOfBirth ?? null,
            residence: body.residence ?? null,
            guardianName: body.guardianName ?? null,
            guardianContact: body.guardianContact ?? null,
            localChurchName: body.localChurchName ?? null,
            localChurchLocation: body.localChurchLocation ?? null,
            district: body.district ?? null,
            phone: body.phone ?? null,
            email: body.email ?? null,
            profileImageUrl: body.profileImageUrl ?? null,
        });
        await repo.save(student);
        if (student.email) {
            try {
                const mj = (0, mailjet_1.getMailjet)();
                const html = getWelcomeEmailHtml(student.fullName, LOGO_URL);
                await mj.post('send', { version: 'v3.1' }).request({
                    Messages: [
                        {
                            From: { Email: 'gnaascms@gmail.com', Name: 'GNAAS UG' },
                            To: [{ Email: student.email, Name: student.fullName }],
                            Subject: 'Welcome to GNAAS UG',
                            HTMLPart: html,
                        },
                    ],
                });
            }
            catch (e) {
                console.error('Mailjet send error', e);
            }
        }
        return res.status(201).json(student);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function nextStudentCode(_req, res) {
    try {
        const repo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const year = new Date().getFullYear();
        const existingThisYear = await repo.createQueryBuilder('s')
            .where('s.code LIKE :prefix', { prefix: `STU-${year}-%` })
            .getCount();
        const code = `STU-${year}-${String(existingThisYear + 1).padStart(3, '0')}`;
        return res.json({ code });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}
function getWelcomeEmailHtml(name, logo) {
    return `
  <div style="font-family: Inter, Arial, sans-serif; background:#f6f9fc; padding:24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <tr>
        <td style="padding:24px; text-align:center; border-bottom:1px solid #e5e7eb;">
          ${logo ? `<img src='${logo}' alt='GNAASUG' width='56' height='56' style='display:inline-block;'/>` : ''}
          <h1 style="margin:12px 0 0; font-size:20px; color:#0f172a;">Welcome to GNAAS UG</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px; color:#334155; font-size:14px; line-height:22px;">
          <p>Dear ${name},</p>
          <p>We’re excited to have you join the GNAAS UG community. Your profile has been created successfully. You can now participate in fellowship activities and attendance tracking.</p>
          <p style="margin:16px 0 0;">Warm regards,<br/>GNAASUG Secretariat</p>
        </td>
      </tr>
    </table>
    <div style="max-width:640px; margin:12px auto 0; text-align:center; color:#94a3b8; font-size:12px;">© ${new Date().getFullYear()} GNAAS UG</div>
  </div>`;
}
async function listStudents(_req, res) {
    try {
        const repo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const students = await repo.find({ order: { createdAt: "DESC" } });
        return res.json(students);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function updateStudent(req, res) {
    try {
        const { id } = req.params;
        const body = req.body;
        const repo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const student = await repo.findOne({ where: { id } });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        // Update student fields
        Object.assign(student, {
            fullName: body.fullName,
            gender: body.gender,
            level: body.level,
            programOfStudy: body.programOfStudy ?? student.programOfStudy ?? null,
            programDurationYears: body.programDurationYears,
            expectedCompletionYear: body.expectedCompletionYear ?? student.expectedCompletionYear ?? null,
            hall: body.hall,
            role: body.role,
            dateOfAdmission: body.dateOfAdmission,
            dateOfBirth: body.dateOfBirth ?? student.dateOfBirth ?? null,
            residence: body.residence ?? student.residence ?? null,
            guardianName: body.guardianName ?? student.guardianName ?? null,
            guardianContact: body.guardianContact ?? student.guardianContact ?? null,
            localChurchName: body.localChurchName ?? student.localChurchName ?? null,
            localChurchLocation: body.localChurchLocation ?? student.localChurchLocation ?? null,
            district: body.district ?? student.district ?? null,
            phone: body.phone ?? null,
            email: body.email ?? null,
            profileImageUrl: body.profileImageUrl ?? null,
        });
        await repo.save(student);
        return res.json(student);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function deleteStudent(req, res) {
    try {
        const { id } = req.params;
        const repo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const student = await repo.findOne({ where: { id } });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        await repo.remove(student);
        return res.json({ message: "Student deleted successfully" });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}
