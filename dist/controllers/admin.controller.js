"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.syncSecretaryProfileImages = syncSecretaryProfileImages;
exports.createSecretary = createSecretary;
exports.promoteStudents = promoteStudents;
exports.undoPromotion = undoPromotion;
exports.getAlumniEligibleStudents = getAlumniEligibleStudents;
exports.getAttendanceInsights = getAttendanceInsights;
exports.getGenderDistribution = getGenderDistribution;
exports.getHallDistribution = getHallDistribution;
exports.getAvailableLevels = getAvailableLevels;
exports.getValidPromotionTargets = getValidPromotionTargets;
const data_source_1 = require("../data-source");
const Student_1 = require("../entities/Student");
const User_1 = require("../entities/User");
const Attendance_1 = require("../entities/Attendance");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ActionLog_1 = require("../entities/ActionLog");
async function listUsers(req, res) {
    try {
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const users = await userRepo.find();
        // Sync profile images from Student records to User records
        for (const user of users) {
            if (user.role === 'SECRETARY' && !user.profileImageUrl) {
                const student = await studentRepo.findOne({ where: { email: user.email } });
                if (student && student.profileImageUrl) {
                    console.log(`Syncing profile image for secretary ${user.email}: ${student.profileImageUrl}`);
                    await userRepo.update(user.id, { profileImageUrl: student.profileImageUrl });
                    user.profileImageUrl = student.profileImageUrl;
                }
            }
        }
        console.log('All users in database:', users.map(u => ({ id: u.id, email: u.email, role: u.role, fullName: u.fullName, profileImageUrl: u.profileImageUrl })));
        return res.json({
            message: "Users retrieved successfully",
            users: users.map(u => ({ id: u.id, email: u.email, role: u.role, fullName: u.fullName, profileImageUrl: u.profileImageUrl }))
        });
    }
    catch (error) {
        console.error('List users error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function syncSecretaryProfileImages(req, res) {
    try {
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        // Get all secretary users
        const secretaries = await userRepo.find({ where: { role: 'SECRETARY' } });
        let syncedCount = 0;
        for (const secretary of secretaries) {
            const student = await studentRepo.findOne({ where: { email: secretary.email } });
            if (student && student.profileImageUrl && !secretary.profileImageUrl) {
                await userRepo.update(secretary.id, { profileImageUrl: student.profileImageUrl });
                syncedCount++;
                console.log(`Synced profile image for secretary ${secretary.email}: ${student.profileImageUrl}`);
            }
        }
        return res.json({
            message: `Successfully synced profile images for ${syncedCount} secretaries`,
            syncedCount
        });
    }
    catch (error) {
        console.error('Sync profile images error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function createSecretary(req, res) {
    try {
        const { fullName, email, phone, studentId, level, hall, gender, role, programDurationYears, dateOfAdmission, profileImageUrl, password } = req.body;
        console.log('Creating secretary with data:', { fullName, email, phone, studentId, level, hall, gender, role, programDurationYears, dateOfAdmission, profileImageUrl });
        if (!fullName || !email || !password || !phone || !studentId || !level || !hall || !gender || !role || !programDurationYears || !dateOfAdmission) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        // Check if user already exists
        const existingUser = await userRepo.findOne({ where: { email } });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ message: "User with this email already exists" });
        }
        // Check if student code already exists
        const existingStudent = await studentRepo.findOne({ where: { code: studentId } });
        if (existingStudent) {
            console.log('Student already exists with code:', studentId);
            return res.status(400).json({ message: "Student with this ID already exists" });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        console.log('Password hashed successfully');
        // Create new secretary user
        const newUser = userRepo.create({
            fullName,
            email,
            passwordHash: hashedPassword,
            role: "SECRETARY",
            profileImageUrl: profileImageUrl || null
        });
        console.log('Creating user with data:', { fullName, email, role: "SECRETARY" });
        const savedUser = await userRepo.save(newUser);
        console.log('User saved successfully with ID:', savedUser.id);
        // Create student record for the secretary
        const newStudent = studentRepo.create({
            code: studentId,
            fullName,
            email,
            phone,
            level,
            hall,
            gender,
            role: role,
            programDurationYears: parseInt(programDurationYears),
            dateOfAdmission: dateOfAdmission,
            profileImageUrl: profileImageUrl || null
        });
        console.log('Creating student with data:', { code: studentId, fullName, email, phone, level, hall, gender, role, programDurationYears, dateOfAdmission, profileImageUrl });
        await studentRepo.save(newStudent);
        console.log('Student saved successfully with ID:', newStudent.id);
        const response = {
            message: "Secretary created successfully",
            user: {
                id: savedUser.id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                role: savedUser.role
            },
            student: {
                id: newStudent.id,
                code: newStudent.code,
                level: newStudent.level,
                hall: newStudent.hall
            }
        };
        console.log('Secretary creation completed successfully:', response);
        return res.status(201).json(response);
    }
    catch (error) {
        console.error('Create secretary error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function promoteStudents(req, res) {
    try {
        const { fromLevel, toLevel } = req.body;
        if (!fromLevel || !toLevel) {
            return res.status(400).json({ message: "From level and to level are required" });
        }
        if (fromLevel === toLevel) {
            return res.status(400).json({ message: "From level and to level must be different" });
        }
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const actionRepo = data_source_1.AppDataSource.getRepository(ActionLog_1.ActionLog);
        // Find all students with the from level
        const studentsToPromote = await studentRepo.find({ where: { level: fromLevel } });
        if (studentsToPromote.length === 0) {
            return res.status(404).json({ message: `No students found with level ${fromLevel}` });
        }
        // Validate promotion is allowed for each student
        const validStudents = [];
        for (const student of studentsToPromote) {
            const currentLevelNum = parseInt(fromLevel.replace('L', ''));
            const maxLevel = student.programDurationYears * 100;
            if (toLevel === 'ALUMNI') {
                if (currentLevelNum >= maxLevel)
                    validStudents.push(student);
            }
            else {
                const targetLevelNum = parseInt(toLevel.replace('L', ''));
                if (targetLevelNum <= maxLevel && targetLevelNum === currentLevelNum + 100)
                    validStudents.push(student);
            }
        }
        if (validStudents.length === 0) {
            return res.status(400).json({ message: `No students can be promoted from ${fromLevel} to ${toLevel} based on their program duration` });
        }
        // Record previous levels for undo
        const priorLevels = validStudents.map(s => ({ id: s.id, from: s.level }));
        // Apply update
        if (toLevel === 'ALUMNI') {
            await studentRepo.update({ level: fromLevel }, { level: 'ALUMNI' });
        }
        else {
            await studentRepo.update({ level: fromLevel }, { level: toLevel });
        }
        // Log action for undo
        const performerUserId = req.auth?.sub || req.user?.id || 'unknown';
        const action = actionRepo.create({
            actionType: 'PROMOTE_STUDENTS',
            performerUserId,
            metadata: {
                fromLevel,
                toLevel,
                affectedStudentIds: validStudents.map(s => s.id)
            },
            undoData: { priorLevels }
        });
        const savedAction = await actionRepo.save(action);
        return res.json({
            message: `Successfully promoted ${validStudents.length} students from ${fromLevel} to ${toLevel}`,
            promotedCount: validStudents.length,
            fromLevel,
            toLevel,
            actionId: savedAction.id
        });
    }
    catch (error) {
        console.error('Promotion error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function undoPromotion(req, res) {
    try {
        const { actionId } = req.params;
        const actionRepo = data_source_1.AppDataSource.getRepository(ActionLog_1.ActionLog);
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const action = await actionRepo.findOne({ where: { id: actionId } });
        if (!action)
            return res.status(404).json({ message: 'Action not found' });
        if (action.actionType !== 'PROMOTE_STUDENTS')
            return res.status(400).json({ message: 'Invalid action type for this endpoint' });
        if (action.undone)
            return res.status(400).json({ message: 'Action already undone' });
        const priorLevels = action.undoData?.priorLevels || [];
        if (priorLevels.length === 0)
            return res.status(200).json({ message: 'Nothing to undo' });
        // Restore previous levels
        for (const item of priorLevels) {
            await studentRepo.update({ id: item.id }, { level: item.from });
        }
        action.undone = true;
        await actionRepo.save(action);
        return res.json({ success: true, restored: priorLevels.length });
    }
    catch (error) {
        console.error('Undo promotion error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
async function getAlumniEligibleStudents(req, res) {
    try {
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        // Find students who are eligible for alumni status
        // Students are eligible if they are at the final level of their program
        const students = await studentRepo.find();
        const eligibleStudents = students.filter(student => {
            // Check if student is at the final level of their program
            const programDuration = student.programDurationYears;
            const currentLevel = parseInt(student.level.replace('L', ''));
            const finalLevel = programDuration * 100; // 4 years = L400, 6 years = L600
            return currentLevel >= finalLevel;
        });
        return res.json({
            eligibleCount: eligibleStudents.length,
            students: eligibleStudents
        });
    }
    catch (error) {
        console.error('Alumni eligibility error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getAttendanceInsights(req, res) {
    try {
        const attendanceRepo = data_source_1.AppDataSource.getRepository(Attendance_1.Attendance);
        // Get attendance data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const attendanceData = await attendanceRepo
            .createQueryBuilder('attendance')
            .where('attendance.date >= :startDate', { startDate: sixMonthsAgo.toISOString().split('T')[0] })
            .getMany();
        // Group by month and calculate insights
        const monthlyData = {};
        attendanceData.forEach(record => {
            const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short' });
            if (!monthlyData[month]) {
                monthlyData[month] = { present: 0, absent: 0, total: 0 };
            }
            if (record.isPresent) {
                monthlyData[month].present++;
            }
            else {
                monthlyData[month].absent++;
            }
            monthlyData[month].total++;
        });
        // Convert to array format for charts
        const insights = Object.entries(monthlyData).map(([month, data]) => ({
            month,
            present: data.present,
            absent: data.absent,
            attendanceRate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
        }));
        return res.json(insights);
    }
    catch (error) {
        console.error('Attendance insights error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getGenderDistribution(req, res) {
    try {
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const students = await studentRepo.find();
        const genderCounts = students.reduce((acc, student) => {
            acc[student.gender] = (acc[student.gender] || 0) + 1;
            return acc;
        }, {});
        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
        const distribution = Object.entries(genderCounts).map(([name, value], index) => ({
            name,
            value,
            color: colors[index % colors.length]
        }));
        return res.json(distribution);
    }
    catch (error) {
        console.error('Gender distribution error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getHallDistribution(req, res) {
    try {
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const attendanceRepo = data_source_1.AppDataSource.getRepository(Attendance_1.Attendance);
        const students = await studentRepo.find();
        const today = new Date().toISOString().split('T')[0];
        // Get today's attendance
        const todayAttendance = await attendanceRepo.find({
            where: { date: today }
        });
        const hallCounts = students.reduce((acc, student) => {
            if (!acc[student.hall]) {
                acc[student.hall] = { total: 0, present: 0 };
            }
            acc[student.hall].total += 1;
            // Check if student was present today
            const attendanceRecord = todayAttendance.find(a => a.studentId === student.id);
            if (attendanceRecord && attendanceRecord.isPresent) {
                acc[student.hall].present += 1;
            }
            return acc;
        }, {});
        const distribution = Object.entries(hallCounts).map(([hall, data]) => ({
            hall,
            totalStudents: data.total,
            presentToday: data.present,
            attendanceRate: Math.round((data.present / data.total) * 100),
            graduationReady: Math.floor(data.total * 0.1) // Placeholder for graduation ready
        }));
        return res.json(distribution);
    }
    catch (error) {
        console.error('Hall distribution error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getAvailableLevels(req, res) {
    try {
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        const students = await studentRepo.find();
        // Get all unique levels and their student counts
        const levelCounts = students.reduce((acc, student) => {
            acc[student.level] = (acc[student.level] || 0) + 1;
            return acc;
        }, {});
        // Generate all possible levels (L100 to L600)
        const allLevels = ['L100', 'L200', 'L300', 'L400', 'L500', 'L600'];
        // Format levels with student counts
        const availableLevels = allLevels.map(level => ({
            level,
            count: levelCounts[level] || 0,
            label: `${level} (${levelCounts[level] || 0} students)`,
            hasStudents: (levelCounts[level] || 0) > 0
        }));
        return res.json(availableLevels);
    }
    catch (error) {
        console.error('Available levels error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getValidPromotionTargets(req, res) {
    try {
        const { fromLevel } = req.query;
        if (!fromLevel) {
            return res.status(400).json({ message: "From level is required" });
        }
        const studentRepo = data_source_1.AppDataSource.getRepository(Student_1.Student);
        // Get students at the from level
        const studentsAtLevel = await studentRepo.find({
            where: { level: fromLevel }
        });
        if (studentsAtLevel.length === 0) {
            return res.json([]);
        }
        // Get unique program durations for students at this level
        const programDurations = [...new Set(studentsAtLevel.map(s => s.programDurationYears))];
        // Generate valid target levels based on program durations
        const validTargets = new Set();
        programDurations.forEach(duration => {
            const currentLevelNum = parseInt(fromLevel.replace('L', ''));
            const maxLevel = duration * 100; // 4 years = L400, 6 years = L600
            // Add next level if not at max
            if (currentLevelNum < maxLevel) {
                const nextLevel = `L${currentLevelNum + 100}`;
                validTargets.add(nextLevel);
            }
            else {
                // At max level, can promote to Alumni
                validTargets.add('ALUMNI');
            }
        });
        // Convert to array and sort
        const targets = Array.from(validTargets).sort((a, b) => {
            if (a === 'ALUMNI')
                return 1;
            if (b === 'ALUMNI')
                return -1;
            return parseInt(a.replace('L', '')) - parseInt(b.replace('L', ''));
        });
        return res.json(targets);
    }
    catch (error) {
        console.error('Valid promotion targets error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
