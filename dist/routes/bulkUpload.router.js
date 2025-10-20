"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bulkUpload_controller_1 = require("../controllers/bulkUpload.controller");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
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
        }
        else {
            cb(new Error('Only CSV and Excel files are allowed'));
        }
    }
});
// Bulk upload students
router.post('/students', auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), upload.single('file'), bulkUpload_controller_1.bulkUploadStudents);
// Undo bulk upload
router.post('/students/undo/:actionId', auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), bulkUpload_controller_1.undoBulkUpload);
// Download template
router.get('/template', auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), bulkUpload_controller_1.downloadTemplate);
exports.default = router;
