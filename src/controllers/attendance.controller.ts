import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Attendance, AttendanceType, AttendanceStatus } from "../entities/Attendance";
import { Student } from "../entities/Student";
import { getMailjet } from "../mail/mailjet";

const LOGO_URL = "https://i.postimg.cc/fbYRk0dM/gnaasug.png";

export async function getAttendanceStatus(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const repo = AppDataSource.getRepository(Attendance);
    
    const attendance = await repo.findOne({
      where: { date },
      relations: ['student']
    });

    const isClosed = attendance?.status === AttendanceStatus.CLOSED;
    
    return res.json({ 
      date, 
      isClosed,
      status: attendance?.status || AttendanceStatus.OPEN 
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUnmarkedMembers(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const { hall, level, gender } = req.query;
    
    const studentRepo = AppDataSource.getRepository(Student);
    const attendanceRepo = AppDataSource.getRepository(Attendance);
    
    // Get all students
    let query = studentRepo.createQueryBuilder('student');
    
    if (hall) query = query.andWhere('student.hall = :hall', { hall });
    if (level) query = query.andWhere('student.level = :level', { level });
    if (gender) query = query.andWhere('student.gender = :gender', { gender });
    
    const allStudents = await query.getMany();
    
    // Get already marked students for this date
    const markedStudents = await attendanceRepo.find({
      where: { 
        date, 
        type: AttendanceType.MEMBER,
        isPresent: true 
      }
    });
    
    const markedStudentIds = markedStudents.map(a => a.studentId).filter(id => id !== null) as string[];
    
    // Filter out already marked students
    const unmarkedStudents = allStudents.filter(student => 
      !markedStudentIds.includes(student.id)
    );
    
    return res.json(unmarkedStudents);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function markMemberAttendance(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const { studentId, isPresent } = req.body;
    const userId = (req as any).auth?.sub;
    
    const repo = AppDataSource.getRepository(Attendance);
    
    // Check if attendance is already closed for this date
    const existingAttendance = await repo.findOne({
      where: { date, type: AttendanceType.MEMBER, studentId }
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: "Attendance already marked for this student" });
    }
    
    // Check if attendance is closed for this date
    const dateStatus = await repo.findOne({
      where: { date, type: AttendanceType.MEMBER }
    });
    
    if (dateStatus?.status === AttendanceStatus.CLOSED) {
      return res.status(400).json({ message: "Attendance is closed for this date" });
    }
    
    const attendance = repo.create({
      date,
      type: AttendanceType.MEMBER,
      studentId,
      isPresent,
      markedBy: userId
    });
    
    await repo.save(attendance);
    
    // Get student info for email
    if (isPresent) {
      const studentRepo = AppDataSource.getRepository(Student);
      const student = await studentRepo.findOne({ where: { id: studentId } });
      
      if (student?.email) {
        try {
          const mj = getMailjet();
          const html = getAttendanceEmailHtml(student.fullName, date, LOGO_URL);
          await mj.post('send', { version: 'v3.1' }).request({
            Messages: [
              {
                From: { Email: 'gnaascms@gmail.com', Name: 'GNAAS UG' },
                To: [{ Email: student.email, Name: student.fullName }],
                Subject: 'Attendance Marked - GNAAS UG',
                HTMLPart: html,
              },
            ],
          });
        } catch (e) {
          console.error('Mailjet send error', e);
        }
      }
    }
    
    return res.status(201).json(attendance);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function markVisitorAttendance(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const { visitorData, isPresent } = req.body;
    const userId = (req as any).auth?.sub;
    
    const repo = AppDataSource.getRepository(Attendance);
    
    // Check if attendance is closed for this date
    const dateStatus = await repo.findOne({
      where: { date, type: AttendanceType.VISITOR }
    });
    
    if (dateStatus?.status === AttendanceStatus.CLOSED) {
      return res.status(400).json({ message: "Attendance is closed for this date" });
    }
    
    const attendance = repo.create({
      date,
      type: AttendanceType.VISITOR,
      visitorName: visitorData.fullName,
      visitorHall: visitorData.hall,
      visitorLevel: visitorData.level,
      visitorPurpose: visitorData.purpose,
      visitorPhone: visitorData.phone,
      visitorEmail: visitorData.email,
      isPresent,
      markedBy: userId
    });
    
    await repo.save(attendance);
    
    // Send email to visitor if present and has email
    if (isPresent && visitorData.email) {
      try {
        const mj = getMailjet();
        const html = getVisitorAttendanceEmailHtml(visitorData.fullName, date, LOGO_URL);
        await mj.post('send', { version: 'v3.1' }).request({
          Messages: [
            {
              From: { Email: 'gnaascms@gmail.com', Name: 'GNAAS UG' },
              To: [{ Email: visitorData.email, Name: visitorData.fullName }],
              Subject: 'Welcome to GNAAS UG - Attendance Marked',
              HTMLPart: html,
            },
          ],
        });
      } catch (e) {
        console.error('Mailjet send error', e);
      }
    }
    
    return res.status(201).json(attendance);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function closeAttendance(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const { type } = req.body;
    
    const repo = AppDataSource.getRepository(Attendance);
    
    // Update all attendance records for this date and type to closed
    await repo.update(
      { date, type },
      { status: AttendanceStatus.CLOSED }
    );
    
    return res.json({ message: "Attendance closed successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAttendanceSummary(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const studentRepo = AppDataSource.getRepository(Student);
    
    const members = await attendanceRepo.find({
      where: { date, type: AttendanceType.MEMBER, isPresent: true }
    });
    
    const visitors = await attendanceRepo.find({
      where: { date, type: AttendanceType.VISITOR, isPresent: true }
    });

    const totalMembers = await studentRepo.count();
    
    return res.json({
      date,
      membersPresent: members.length,
      membersAbsent: totalMembers - members.length,
      visitorsPresent: visitors.length,
      totalPresent: members.length + visitors.length,
      totalAbsent: totalMembers - members.length,
      totalMembers,
      totalVisitors: visitors.length
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMembersPresent(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const attendanceRepo = AppDataSource.getRepository(Attendance);

    const presentMembers = await attendanceRepo.find({
      where: { 
        date, 
        type: AttendanceType.MEMBER, 
        isPresent: true 
      },
      relations: ['student']
    });

    const membersData = presentMembers
      .filter(attendance => attendance.student)
      .map(attendance => attendance.student);

    return res.json(membersData);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMembersAbsent(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const studentRepo = AppDataSource.getRepository(Student);

    // Get all students
    const allStudents = await studentRepo.find();

    // Get students who were marked present
    const presentAttendances = await attendanceRepo.find({
      where: { 
        date, 
        type: AttendanceType.MEMBER, 
        isPresent: true 
      }
    });

    const presentStudentIds = presentAttendances
      .map(attendance => attendance.studentId)
      .filter(id => id !== null);

    // Filter out present students to get absent ones
    const absentStudents = allStudents.filter(student => 
      !presentStudentIds.includes(student.id)
    );

    return res.json(absentStudents);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getVisitors(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const attendanceRepo = AppDataSource.getRepository(Attendance);

    const visitors = await attendanceRepo.find({
      where: { 
        date, 
        type: AttendanceType.VISITOR, 
        isPresent: true 
      },
      order: { createdAt: 'ASC' }
    });

    return res.json(visitors);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

function getAttendanceEmailHtml(name: string, date: string, logo?: string) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
  <div style="font-family: Inter, Arial, sans-serif; background:#f6f9fc; padding:24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <tr>
        <td style="padding:24px; text-align:center; border-bottom:1px solid #e5e7eb;">
          ${logo ? `<img src='${logo}' alt='GNAAS UG' width='56' height='56' style='display:inline-block;'/>` : ''}
          <h1 style="margin:12px 0 0; font-size:20px; color:#0f172a;">Attendance Marked</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px; color:#334155; font-size:14px; line-height:22px;">
          <p>Dear ${name},</p>
          <p>Your attendance has been successfully marked for <strong>${formattedDate}</strong>.</p>
          <p>Thank you for participating in our fellowship activities. We appreciate your presence and commitment to the GNAAS UG community.</p>
          <p style="margin:16px 0 0;">Blessings,<br/>GNAASUG Secretariat</p>
        </td>
      </tr>
    </table>
    <div style="max-width:640px; margin:12px auto 0; text-align:center; color:#94a3b8; font-size:12px;">© ${new Date().getFullYear()} GNAAS UG</div>
  </div>`;
}


export async function getWeeklyAttendanceStats(req: Request, res: Response) {
  try {
    const { week } = req.query; // Format: YYYY-WW (e.g., 2024-01)
    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const studentRepo = AppDataSource.getRepository(Student);

    // Calculate date range for the week
    let startDate: Date;
    let endDate: Date;

    if (week) {
      // Parse week format (YYYY-WW)
      const [year, weekNum] = week.toString().split('-');
      const firstDayOfYear = new Date(parseInt(year), 0, 1);
      const daysToAdd = (parseInt(weekNum) - 1) * 7;
      startDate = new Date(firstDayOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    } else {
      // Default to current week
      const now = new Date();
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    }

    // Get attendance data for the week
    const weeklyAttendance = await attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.date >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
      .andWhere('attendance.date <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
      .getMany();

    // Get total students count
    const totalStudents = await studentRepo.count();

    // Calculate daily statistics
    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayAttendance = weeklyAttendance.filter((a: any) => a.date === dateStr);
      const presentCount = dayAttendance.filter((a: any) => a.isPresent === true).length;
      const absentCount = dayAttendance.filter((a: any) => a.isPresent === false).length;
      const visitorsCount = dayAttendance.filter((a: any) => a.type === AttendanceType.VISITOR).length;

      dailyStats.push({
        date: dateStr,
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        present: presentCount,
        absent: absentCount,
        visitors: visitorsCount,
        total: presentCount + absentCount + visitorsCount,
        attendanceRate: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0
      });
    }

    // Calculate weekly totals
    const weeklyTotals = {
      totalPresent: dailyStats.reduce((sum, day) => sum + day.present, 0),
      totalAbsent: dailyStats.reduce((sum, day) => sum + day.absent, 0),
      totalVisitors: dailyStats.reduce((sum, day) => sum + day.visitors, 0),
      averageAttendanceRate: Math.round(dailyStats.reduce((sum, day) => sum + day.attendanceRate, 0) / 7)
    };

    // Get hall-wise statistics
    const hallStats = await attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin('attendance.student', 'student')
      .select('student.hall', 'hall')
      .addSelect('COUNT(*)', 'totalAttendance')
      .addSelect('SUM(CASE WHEN attendance.isPresent = true THEN 1 ELSE 0 END)', 'presentCount')
      .where('attendance.date >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
      .andWhere('attendance.date <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
      .andWhere('attendance.type = :member', { member: AttendanceType.MEMBER })
      .groupBy('student.hall')
      .getRawMany();

    // Get level-wise statistics
    const levelStats = await attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin('attendance.student', 'student')
      .select('student.level', 'level')
      .addSelect('COUNT(*)', 'totalAttendance')
      .addSelect('SUM(CASE WHEN attendance.isPresent = true THEN 1 ELSE 0 END)', 'presentCount')
      .where('attendance.date >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
      .andWhere('attendance.date <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
      .andWhere('attendance.type = :member', { member: AttendanceType.MEMBER })
      .groupBy('student.level')
      .getRawMany();

    return res.json({
      week: week || `${startDate.getFullYear()}-${Math.ceil((startDate.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      totalStudents,
      dailyStats,
      weeklyTotals,
      hallStats: hallStats.map(h => ({
        hall: h.hall || 'Unknown',
        totalAttendance: parseInt(h.totalAttendance),
        presentCount: parseInt(h.presentCount),
        attendanceRate: h.totalAttendance > 0 ? Math.round((h.presentCount / h.totalAttendance) * 100) : 0
      })),
      levelStats: levelStats.map(l => ({
        level: l.level || 'Unknown',
        totalAttendance: parseInt(l.totalAttendance),
        presentCount: parseInt(l.presentCount),
        attendanceRate: l.totalAttendance > 0 ? Math.round((l.presentCount / l.totalAttendance) * 100) : 0
      }))
    });
  } catch (e) {
    console.error('Weekly attendance stats error:', e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Monthly Attendance Trends
export async function getMonthlyAttendanceTrends(req: Request, res: Response) {
  try {
    const { months = 6 } = req.query; // Default to last 6 months
    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const studentRepo = AppDataSource.getRepository(Student);

    const totalStudents = await studentRepo.count();
    const trends = [];

    for (let i = parseInt(months.toString()) - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const monthlyAttendance = await attendanceRepo
        .createQueryBuilder('attendance')
        .where('attendance.date >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
        .andWhere('attendance.date <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
        .getMany();

      const presentCount = monthlyAttendance.filter((a: any) => a.isPresent === true).length;
      const visitorsCount = monthlyAttendance.filter((a: any) => a.type === AttendanceType.VISITOR).length;
      const totalAttendance = monthlyAttendance.length;

      trends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        year,
        monthNumber: month,
        present: presentCount,
        visitors: visitorsCount,
        totalAttendance,
        attendanceRate: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0
      });
    }

    return res.json({
      totalStudents,
      trends
    });
  } catch (e) {
    console.error('Monthly trends error:', e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

function getVisitorAttendanceEmailHtml(name: string, date: string, logo?: string) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
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
          <p>Thank you for visiting GNAAS UG on <strong>${formattedDate}</strong>. Your attendance has been recorded.</p>
          <p>We hope you had a wonderful time with us and felt welcomed in our fellowship. We look forward to seeing you again soon!</p>
          <p style="margin:16px 0 0;">Blessings,<br/>GNAASUG Secretariat</p>
        </td>
      </tr>
    </table>
    <div style="max-width:640px; margin:12px auto 0; text-align:center; color:#94a3b8; font-size:12px;">© ${new Date().getFullYear()} GNAAS UG</div>
  </div>`;
}
