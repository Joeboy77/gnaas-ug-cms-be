import { Router } from "express";
import { bulkUploadStudents, downloadTemplate, undoBulkUpload } from "../controllers/bulkUpload.controller";
import { requireAuth, requireRoles } from "../middleware/auth";
import multer from "multer";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow CSV and Excel files
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// Bulk upload students
router.post('/students', 
  requireAuth, 
  requireRoles("SUPER_ADMIN", "SECRETARY"), 
  upload.single('file'), 
  bulkUploadStudents
);

// Undo bulk upload
router.post('/students/undo/:actionId',
  requireAuth,
  requireRoles("SUPER_ADMIN", "SECRETARY"),
  undoBulkUpload
);

// Download template
router.get('/template', 
  requireAuth, 
  requireRoles("SUPER_ADMIN", "SECRETARY"), 
  downloadTemplate
);

export default router;
