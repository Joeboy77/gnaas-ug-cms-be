import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Student } from "../entities/Student";
import { Attendance } from "../entities/Attendance";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export async function getAttendanceReport(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const studentRepo = AppDataSource.getRepository(Student);

    // Get all students count
    const totalStudents = await studentRepo.count();

    // Get attendance data for the date range
    const attendanceData = await attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('attendance.date', 'ASC')
      .getMany();

    // Group by date and calculate stats
    const reportData = attendanceData.reduce((acc, record) => {
      const date = new Date(record.date).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          present: 0,
          absent: 0,
          attendanceRate: 0
        };
      }

      if (record.isPresent) {
        acc[date].present++;
      } else {
        acc[date].absent++;
      }

      acc[date].attendanceRate = totalStudents > 0 ? 
        Math.round((acc[date].present / totalStudents) * 100) : 0;

      return acc;
    }, {} as Record<string, any>);

    const result = Object.values(reportData);
    return res.json(result);

  } catch (error) {
    console.error('Attendance report error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getLevelReport(req: Request, res: Response) {
  try {
    const studentRepo = AppDataSource.getRepository(Student);
    const attendanceRepo = AppDataSource.getRepository(Attendance);

    // Get all students grouped by level
    const students = await studentRepo.find();
    const levelGroups = students.reduce((acc, student) => {
      if (!acc[student.level]) {
        acc[student.level] = [];
      }
      acc[student.level].push(student);
      return acc;
    }, {} as Record<string, Student[]>);

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.date >= :today AND attendance.date < :tomorrow', { today, tomorrow })
      .getMany();

    const presentToday = new Set(todayAttendance
      .filter(a => a.isPresent)
      .map(a => a.studentId)
    );

    const reportData = Object.entries(levelGroups).map(([level, students]) => {
      const presentCount = students.filter(s => presentToday.has(s.id)).length;
      const attendanceRate = students.length > 0 ? 
        Math.round((presentCount / students.length) * 100) : 0;

      return {
        level,
        totalStudents: students.length,
        presentToday: presentCount,
        attendanceRate
      };
    }).sort((a, b) => a.level.localeCompare(b.level));

    return res.json(reportData);

  } catch (error) {
    console.error('Level report error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getHallReport(req: Request, res: Response) {
  try {
    const studentRepo = AppDataSource.getRepository(Student);
    const attendanceRepo = AppDataSource.getRepository(Attendance);

    // Get all students grouped by hall
    const students = await studentRepo.find();
    const hallGroups = students.reduce((acc, student) => {
      if (!acc[student.hall]) {
        acc[student.hall] = [];
      }
      acc[student.hall].push(student);
      return acc;
    }, {} as Record<string, Student[]>);

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await attendanceRepo
      .createQueryBuilder('attendance')
      .where('attendance.date >= :today AND attendance.date < :tomorrow', { today, tomorrow })
      .getMany();

    const presentToday = new Set(todayAttendance
      .filter(a => a.isPresent)
      .map(a => a.studentId)
    );

    const reportData = Object.entries(hallGroups).map(([hall, students]) => {
      const presentCount = students.filter(s => presentToday.has(s.id)).length;
      const attendanceRate = students.length > 0 ? 
        Math.round((presentCount / students.length) * 100) : 0;

      return {
        hall,
        totalStudents: students.length,
        presentToday: presentCount,
        attendanceRate
      };
    }).sort((a, b) => a.hall.localeCompare(b.hall));

    return res.json(reportData);

  } catch (error) {
    console.error('Hall report error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getGenderReport(req: Request, res: Response) {
  try {
    const studentRepo = AppDataSource.getRepository(Student);
    
    const students = await studentRepo.find();
    const totalStudents = students.length;

    const genderCounts = students.reduce((acc, student) => {
      acc[student.gender] = (acc[student.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const reportData = Object.entries(genderCounts).map(([gender, count]) => ({
      gender,
      count,
      percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0
    }));

    return res.json(reportData);

  } catch (error) {
    console.error('Gender report error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMonthlyTrends(req: Request, res: Response) {
  try {
    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const studentRepo = AppDataSource.getRepository(Student);

    // Get last 6 months
    const endDate = new Date();
    const startDate = subMonths(endDate, 6);

    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    const reportData = await Promise.all(months.map(async (month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const attendanceData = await attendanceRepo
        .createQueryBuilder('attendance')
        .where('attendance.date BETWEEN :start AND :end', { 
          start: monthStart, 
          end: monthEnd 
        })
        .getMany();

      const totalAttendance = attendanceData.length;
      const presentCount = attendanceData.filter(a => a.isPresent).length;
      const averageRate = totalAttendance > 0 ? 
        Math.round((presentCount / totalAttendance) * 100) : 0;

      return {
        month: format(month, 'MMM yyyy'),
        totalAttendance,
        averageRate
      };
    }));

    return res.json(reportData);

  } catch (error) {
    console.error('Monthly trends error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function exportReport(req: Request, res: Response) {
  try {
    const { reportType } = req.params;
    const { format, startDate, endDate } = req.query;

    // This is a placeholder for export functionality
    // You would implement actual export logic here based on the reportType and format
    
    return res.json({ 
      message: `Export functionality for ${reportType} in ${format} format will be implemented`,
      reportType,
      format,
      startDate,
      endDate
    });

  } catch (error) {
    console.error('Export report error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
