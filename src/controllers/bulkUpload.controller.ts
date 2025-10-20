import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Student } from "../entities/Student";
import { getMailjet } from "../mail/mailjet";
import * as XLSX from 'xlsx';
const csv = require('csv-parser');
import { Readable } from 'stream';
import { ActionLog } from "../entities/ActionLog";
import { In } from "typeorm";

const LOGO_URL = "https://i.postimg.cc/fbYRk0dM/gnaasug.png";

interface BulkUploadResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  createdStudents: Array<{
    id: string;
    code: string;
    fullName: string;
  }>;
  actionId?: string;
}

// Expected column headers mapping
const COLUMN_MAPPING = {
  'Student ID': 'code',
  'Full Name': 'fullName',
  'Gender': 'gender',
  'Academic Level': 'level',
  'Program of study': 'programOfStudy',
  'Duration of Program': 'programDurationYears',
  'Expected Completion Year': 'expectedCompletionYear',
  'Hall/Hostel': 'hall',
  'Contact': 'phone',
  'Email': 'email',
  'Date of Birth': 'dateOfBirth',
  'Place of Residence': 'residence',
  'Parent/Guardian Name': 'guardianName',
  'Parent/Guardian Contact': 'guardianContact',
  'Local Church Name': 'localChurchName',
  'Local church location': 'localChurchLocation',
  'District': 'district',
  'Date of Admission': 'dateOfAdmission',
  'Role': 'role',
  'Profile Image URL': 'profileImageUrl'
};

// Function to normalize level format
function normalizeLevel(level: string): string {
  if (!level) return '';
  
  const levelStr = level.toString().trim().toLowerCase();
  
  // Handle various formats: "Level 100", "level 100", "L100", "100", etc.
  if (levelStr.includes('100')) return 'L100';
  if (levelStr.includes('200')) return 'L200';
  if (levelStr.includes('300')) return 'L300';
  if (levelStr.includes('400')) return 'L400';
  if (levelStr.includes('500')) return 'L500';
  if (levelStr.includes('600')) return 'L600';
  
  // If it already starts with L, return as is
  if (levelStr.startsWith('l')) return levelStr.toUpperCase();
  
  return levelStr.toUpperCase();
}

// Function to convert Excel serial date to proper date string
function convertExcelDate(excelDate: any): string | null {
  if (!excelDate) return null;
  
  // If it's already a Date object, convert to string
  if (excelDate instanceof Date) {
    return excelDate.toISOString().split('T')[0];
  }
  
  // If it's a string that looks like a date, return as is
  if (typeof excelDate === 'string' && (excelDate.includes('/') || excelDate.includes('-'))) {
    return excelDate;
  }
  
  // If it's a number (Excel serial date), convert it
  if (typeof excelDate === 'number' || !isNaN(Number(excelDate))) {
    const serialNumber = Number(excelDate);
    
    // Skip very small numbers that are likely not dates
    if (serialNumber < 1) return null;
    
    try {
      // Excel serial date calculation
      // Excel counts days since January 1, 1900
      const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      
      // Excel serial date starts from 1, not 0, so we subtract 1
      const adjustedSerial = serialNumber - 1;
      
      // Calculate the actual date
      const actualDate = new Date(excelEpoch.getTime() + (adjustedSerial * millisecondsPerDay));
      
      // Check if the date is valid and reasonable (between 1900 and 2100)
      if (isNaN(actualDate.getTime())) {
        return null;
      }
      
      const year = actualDate.getFullYear();
      if (year < 1900 || year > 2100) {
        return null;
      }
      
      return actualDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error converting Excel date:', error);
      return null;
    }
  }
  
  return null;
}

function validateStudentData(row: any, rowIndex: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!row.fullName?.toString().trim()) errors.push('Full Name is required');
  if (!row.gender?.toString().trim()) errors.push('Gender is required');
  if (!row.level?.toString().trim()) errors.push('Academic Level is required');
  if (!row.hall?.toString().trim()) errors.push('Hall/Hostel is required');
  // Date of Admission is optional but will get a default value if missing
  
  // Validate gender
  if (row.gender && !['Male', 'Female'].includes(row.gender.toString().trim())) {
    errors.push('Gender must be Male or Female');
  }
  
  // Validate level
  if (row.level) {
    const normalizedLevel = normalizeLevel(row.level.toString());
    if (!['L100', 'L200', 'L300', 'L400', 'L500', 'L600'].includes(normalizedLevel)) {
      errors.push('Academic Level must be L100, L200, L300, L400, L500, or L600 (supports formats like "Level 100", "level 100", "L100", etc.)');
    }
  }
  
  // Validate program duration
  if (row.programDurationYears) {
    const duration = parseInt(row.programDurationYears);
    if (isNaN(duration) || duration < 1 || duration > 6) {
      errors.push('Program Duration must be between 1 and 6 years');
    }
  }
  
  // Validate expected completion year
  if (row.expectedCompletionYear) {
    const year = parseInt(row.expectedCompletionYear);
    if (isNaN(year) || year < 1900 || year > 2100) {
      errors.push('Expected Completion Year must be between 1900 and 2100');
    }
  }
  
  // Validate email format
  if (row.email && row.email.toString().trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email.toString().trim())) {
      errors.push('Invalid email format');
    }
  }
  
  // Validate profile image URL format
  if (row.profileImageUrl && row.profileImageUrl.toString().trim()) {
    try {
      new URL(row.profileImageUrl.toString().trim());
    } catch {
      errors.push('Invalid Profile Image URL format');
    }
  }
  
  // Validate date formats (Date of Admission is optional, will get default if missing)
  if (row.dateOfAdmission) {
    const convertedDate = convertExcelDate(row.dateOfAdmission);
    if (!convertedDate || isNaN(Date.parse(convertedDate))) {
      errors.push('Invalid Date of Admission format');
    }
  }
  
  if (row.dateOfBirth && row.dateOfBirth.toString().trim()) {
    const convertedDate = convertExcelDate(row.dateOfBirth);
    if (!convertedDate || isNaN(Date.parse(convertedDate))) {
      errors.push('Invalid Date of Birth format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function mapRowData(row: any): any {
  const mappedRow: any = {};
  
  // Map columns to our field names
  Object.entries(COLUMN_MAPPING).forEach(([excelHeader, ourField]) => {
    if (row[excelHeader] !== undefined) {
      mappedRow[ourField] = row[excelHeader];
    }
  });
  
  // Set defaults
  if (!mappedRow.role) {
    mappedRow.role = 'Member';
  }
  
  if (!mappedRow.programDurationYears) {
    mappedRow.programDurationYears = 4; // Default to 4 years
  }
  
  // Convert types
  if (mappedRow.programDurationYears) {
    mappedRow.programDurationYears = parseInt(mappedRow.programDurationYears);
  }
  
  if (mappedRow.expectedCompletionYear) {
    mappedRow.expectedCompletionYear = parseInt(mappedRow.expectedCompletionYear);
  }
  
  // Normalize level format
  if (mappedRow.level) {
    mappedRow.level = normalizeLevel(mappedRow.level.toString());
  }
  
  // Convert dates to strings using Excel date conversion
  if (mappedRow.dateOfAdmission) {
    const convertedDate = convertExcelDate(mappedRow.dateOfAdmission);
    mappedRow.dateOfAdmission = convertedDate || mappedRow.dateOfAdmission.toString();
  } else {
    // Provide default date of admission if missing (current date)
    mappedRow.dateOfAdmission = new Date().toISOString().split('T')[0];
  }
  
  if (mappedRow.dateOfBirth) {
    const convertedDate = convertExcelDate(mappedRow.dateOfBirth);
    mappedRow.dateOfBirth = convertedDate || mappedRow.dateOfBirth.toString();
  }
  
  // Clean string fields
  Object.keys(mappedRow).forEach(key => {
    if (typeof mappedRow[key] === 'string') {
      mappedRow[key] = mappedRow[key].trim();
      if (mappedRow[key] === '') {
        mappedRow[key] = null;
      }
    }
  });
  
  return mappedRow;
}

async function generateStudentCode(repo: any): Promise<string> {
  const year = new Date().getFullYear();
  const existingThisYear = await repo.createQueryBuilder('s')
    .where('s.code LIKE :prefix', { prefix: `STU-${year}-%` })
    .getCount();
  return `STU-${year}-${String(existingThisYear + 1).padStart(3, '0')}`;
}

export async function bulkUploadStudents(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const repo = AppDataSource.getRepository(Student);
    const actionRepo = AppDataSource.getRepository(ActionLog);
    const result: BulkUploadResult = {
      success: false,
      totalRows: 0,
      successfulRows: 0,
      failedRows: 0,
      errors: [],
      createdStudents: []
    };

    let rows: any[] = [];

    // Parse file based on type
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      // Parse CSV
      rows = await parseCSV(file.buffer);
    } else if (file.mimetype.includes('spreadsheet') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      // Parse Excel
      rows = await parseExcel(file.buffer);
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Please upload CSV or Excel files.' });
    }

    result.totalRows = rows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 2;

      try {
        const mappedRow = mapRowData(row);
        const validation = validateStudentData(mappedRow, rowIndex);
        if (!validation.isValid) {
          result.errors.push({ row: rowIndex, error: validation.errors.join(', '), data: row });
          result.failedRows++;
          continue;
        }

        const existingStudent = await repo.findOne({ where: [{ email: mappedRow.email }, { code: mappedRow.code }] });
        if (existingStudent) {
          result.errors.push({ row: rowIndex, error: `Student already exists with email: ${mappedRow.email} or code: ${mappedRow.code}`, data: row });
          result.failedRows++;
          continue;
        }

        if (!mappedRow.code) {
          mappedRow.code = await generateStudentCode(repo);
        }

        const student = repo.create(mappedRow);
        const savedStudent = await repo.save(student) as unknown as Student;

        result.createdStudents.push({ id: savedStudent.id, code: savedStudent.code || '', fullName: savedStudent.fullName });
        result.successfulRows++;

        if (savedStudent.email) {
          try {
            const mj = getMailjet();
            const html = getWelcomeEmailHtml(savedStudent.fullName, LOGO_URL);
            await mj.post('send', { version: 'v3.1' }).request({
              Messages: [
                {
                  From: { Email: 'gnaascms@gmail.com', Name: 'GNAAS UG' },
                  To: [{ Email: savedStudent.email, Name: savedStudent.fullName }],
                  Subject: 'Welcome to GNAAS UG',
                  HTMLPart: html,
                },
              ],
            });
          } catch (emailError) {
            console.error('Email send error for student:', savedStudent.fullName, emailError);
          }
        }

      } catch (error) {
        result.errors.push({ row: rowIndex, error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`, data: row });
        result.failedRows++;
      }
    }

    // Create an ActionLog for undo if we created any students
    if (result.successfulRows > 0) {
      const performerUserId = (req as any).auth?.sub || (req as any).user?.id || 'unknown';
      const action = actionRepo.create({
        actionType: 'BULK_UPLOAD_STUDENTS',
        performerUserId,
        metadata: {
          createdStudentIds: result.createdStudents.map(s => s.id),
          counts: { successes: result.successfulRows, failures: result.failedRows },
          source: file.originalname,
        },
        undoData: null,
      });
      const savedAction = await actionRepo.save(action);
      result.actionId = savedAction.id;
    }

    result.success = result.successfulRows > 0;
    return res.status(200).json(result);

  } catch (error) {
    console.error('Bulk upload error:', error);
    return res.status(500).json({ message: 'Internal server error during bulk upload', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export async function undoBulkUpload(req: Request, res: Response) {
  try {
    const { actionId } = req.params as { actionId: string };
    const actionRepo = AppDataSource.getRepository(ActionLog);
    const studentRepo = AppDataSource.getRepository(Student);

    const action = await actionRepo.findOne({ where: { id: actionId } });
    if (!action) return res.status(404).json({ message: 'Action not found' });
    if (action.actionType !== 'BULK_UPLOAD_STUDENTS') return res.status(400).json({ message: 'Action type not undoable by this endpoint' });
    if (action.undone) return res.status(400).json({ message: 'Action already undone' });

    const createdIds: string[] = action.metadata?.createdStudentIds || [];
    if (createdIds.length === 0) return res.status(200).json({ message: 'Nothing to undo' });

    // Delete in chunks to avoid parameter limits
    const chunkSize = 100;
    for (let i = 0; i < createdIds.length; i += chunkSize) {
      const batch = createdIds.slice(i, i + chunkSize);
      await studentRepo.delete({ id: In(batch) });
    }

    action.undone = true;
    await actionRepo.save(action);

    return res.status(200).json({ success: true, undone: createdIds.length });
  } catch (error) {
    console.error('Undo bulk upload error:', error);
    return res.status(500).json({ message: 'Internal server error during undo', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function parseCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const rows: any[] = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (row: any) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function parseExcel(buffer: Buffer): Promise<any[]> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return jsonData;
}

function getWelcomeEmailHtml(name: string, logo?: string) {
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
          <p>We're excited to have you join the GNAAS UG community. Your profile has been created successfully through our bulk upload system. You can now participate in fellowship activities and attendance tracking.</p>
          <p style="margin:16px 0 0;">Warm regards,<br/>GNAASUG Secretariat</p>
        </td>
      </tr>
    </table>
    <div style="max-width:640px; margin:12px auto 0; text-align:center; color:#94a3b8; font-size:12px;">© ${new Date().getFullYear()} GNAAS UG</div>
  </div>`;
}

export async function downloadTemplate(req: Request, res: Response) {
  try {
    const templateData = [
      {
        'Student ID': 'STU-2024-001',
        'Full Name': 'John Doe',
        'Gender': 'Male',
        'Academic Level': 'Level 100',
        'Program of study': 'Computer Science',
        'Duration of Program': '4',
        'Expected Completion Year': '2027',
        'Hall/Hostel': 'Legon',
        'Contact': '+233123456789',
        'Email': 'john.doe@example.com',
        'Date of Birth': '2000-01-15',
        'Place of Residence': 'Madina',
        'Parent/Guardian Name': 'Jane Doe',
        'Parent/Guardian Contact': '+233987654321',
        'Local Church Name': 'Legon SDA',
        'Local church location': 'Legon',
        'District': 'Accra North',
        'Date of Admission': '2024-01-15',
        'Role': 'Member',
        'Profile Image URL': 'https://example.com/profile-image.jpg'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="students_template.xlsx"');
    res.send(buffer);

  } catch (error) {
    console.error('Template download error:', error);
    return res.status(500).json({ message: 'Error generating template' });
  }
}
