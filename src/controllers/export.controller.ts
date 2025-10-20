import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Student } from "../entities/Student";
import { User } from "../entities/User";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportFilters {
  hall?: string;
  level?: string;
  gender?: string;
  role?: string;
  status?: string;
  programDuration?: string;
  admissionYear?: string;
}

interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface IncludeOptions {
  personalInfo?: boolean;
  contactInfo?: boolean;
  attendance?: boolean;
}

export async function exportStudents(req: Request, res: Response) {
  try {
    const { format, filters, dateRange, includeOptions } = req.body;
    const { hall, level, gender, role, status, programDuration, admissionYear } = filters as ExportFilters;
    const { startDate, endDate } = (dateRange as DateRange) || {};
    const { personalInfo = true, contactInfo = true, attendance = false } = (includeOptions as IncludeOptions) || {};

    // Build query with filters
    const studentRepo = AppDataSource.getRepository(Student);
    let query = studentRepo.createQueryBuilder('student');

    if (hall) query = query.andWhere('student.hall = :hall', { hall });
    if (level) query = query.andWhere('student.level = :level', { level });
    if (gender) query = query.andWhere('student.gender = :gender', { gender });
    if (role) query = query.andWhere('student.role = :role', { role });
    if (status) {
      // For now, all students are considered "Active"
      // You can modify this based on your status logic
    }
    if (programDuration) query = query.andWhere('student.programDurationYears = :programDuration', { programDuration: parseInt(programDuration) });
    if (admissionYear) {
      const startOfYear = `${admissionYear}-01-01`;
      const endOfYear = `${admissionYear}-12-31`;
      query = query.andWhere('student.dateOfAdmission >= :startOfYear AND student.dateOfAdmission <= :endOfYear', { 
        startOfYear, 
        endOfYear 
      });
    }
    
    // Date range filter for admission date
    if (startDate) {
      query = query.andWhere('student.dateOfAdmission >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('student.dateOfAdmission <= :endDate', { endDate });
    }

    const students = await query.getMany();

    // Prepare data for export based on include options
    const exportData = students.map((student: Student) => {
      const baseData: any = {
        'Student ID': student.code,
        'Full Name': student.fullName,
        'Level': student.level,
        'Hall': student.hall,
        'Role': student.role,
        'Date Added': new Date(student.createdAt).toLocaleDateString(),
        'Status': 'Active'
      };

      // Add personal information if requested
      if (personalInfo) {
        baseData['Gender'] = student.gender;
        baseData['Program Duration'] = `${student.programDurationYears} years`;
        baseData['Program of Study'] = student.programOfStudy || 'N/A';
        baseData['Expected Completion Year'] = student.expectedCompletionYear || 'N/A';
        baseData['Date of Birth'] = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A';
        baseData['Place of Residence'] = student.residence || 'N/A';
      }

      // Add contact information if requested
      if (contactInfo) {
        baseData['Phone'] = student.phone || 'N/A';
        baseData['Email'] = student.email || 'N/A';
      }

      // Add guardian information if requested
      if (personalInfo) {
        baseData['Parent/Guardian Name'] = student.guardianName || 'N/A';
        baseData['Parent/Guardian Contact'] = student.guardianContact || 'N/A';
      }

      // Add church information if requested
      if (personalInfo) {
        baseData['Local Church Name'] = student.localChurchName || 'N/A';
        baseData['Local Church Location'] = student.localChurchLocation || 'N/A';
        baseData['District'] = student.district || 'N/A';
      }

      // Add admission date if available
      if (student.dateOfAdmission) {
        baseData['Date of Admission'] = new Date(student.dateOfAdmission).toLocaleDateString();
      }

      // Add profile image URL if available
      if (student.profileImageUrl) {
        baseData['Profile Image URL'] = student.profileImageUrl;
      }

      return baseData;
    });

    const filename = `students_export_${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'excel':
        return await exportToExcel(res, exportData, filename);
      case 'pdf':
        return await exportToPDF(res, exportData, filename);
      case 'csv':
        return await exportToCSV(res, exportData, filename);
      default:
        return res.status(400).json({ message: 'Invalid export format' });
    }
  } catch (e) {
    console.error('Export error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function exportToExcel(res: Response, data: any[], filename: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');

  // Add headers
  const headers = Object.keys(data[0] || {});
  worksheet.addRow(headers);

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE7F3FF' }
  };

  // Add data
  data.forEach(row => {
    worksheet.addRow(Object.values(row));
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
}

async function exportToPDF(res: Response, data: any[], filename: string) {
  try {
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(16);
    doc.text('GNAAS UG - Students Export', 14, 22);
    
    // Add export date
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 30);

    if (data.length === 0) {
      doc.setFontSize(12);
      doc.text('No data to export', 14, 50);
    } else {
      // Prepare table data
      const headers = Object.keys(data[0] || {});
      const rows = data.map(row => Object.values(row));

      // Check if autoTable method exists
      if (typeof (doc as any).autoTable === 'function') {
        // Add table using autoTable
        (doc as any).autoTable({
          head: [headers],
          body: rows,
          startY: 40,
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [231, 243, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          margin: { top: 40 },
        });
      } else {
        // Fallback: create a simple table manually
        doc.setFontSize(10);
        let yPosition = 50;
        
        // Add headers
        headers.forEach((header: string, index: number) => {
          doc.text(header.toString(), 14 + (index * 40), yPosition);
        });
        yPosition += 10;
        
        // Add data rows
        rows.slice(0, 20).forEach((row, rowIndex) => { // Limit to 20 rows for PDF
          row.forEach((cell: any, cellIndex: number) => {
            doc.text(cell.toString(), 14 + (cellIndex * 40), yPosition);
          });
          yPosition += 8;
        });
      }
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

    res.send(doc.output('arraybuffer'));
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}

async function exportToCSV(res: Response, data: any[], filename: string) {
  if (data.length === 0) {
    return res.status(400).json({ message: 'No data to export' });
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    )
  ].join('\n');

  // Set response headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);

  res.send(csvContent);
}

export async function getExportFilters(req: Request, res: Response) {
  try {
    const studentRepo = AppDataSource.getRepository(Student);
    
    // Get unique values for filters
    const halls = await studentRepo
      .createQueryBuilder('student')
      .select('DISTINCT student.hall', 'hall')
      .where('student.hall IS NOT NULL')
      .getRawMany();

    const levels = await studentRepo
      .createQueryBuilder('student')
      .select('DISTINCT student.level', 'level')
      .where('student.level IS NOT NULL')
      .getRawMany();

    const genders = await studentRepo
      .createQueryBuilder('student')
      .select('DISTINCT student.gender', 'gender')
      .where('student.gender IS NOT NULL')
      .getRawMany();

    const roles = await studentRepo
      .createQueryBuilder('student')
      .select('DISTINCT student.role', 'role')
      .where('student.role IS NOT NULL')
      .getRawMany();

    return res.json({
      halls: halls.map(h => h.hall).filter(Boolean),
      levels: levels.map(l => l.level).filter(Boolean),
      genders: genders.map(g => g.gender).filter(Boolean),
      roles: roles.map(r => r.role).filter(Boolean),
      statuses: ['Active', 'Alumni'] // Static for now
    });
  } catch (e) {
    console.error('Get export filters error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
