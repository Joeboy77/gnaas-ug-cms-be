# GNAAS CMS Backend

A comprehensive backend API for the Ghana National Association of Adventist Students (GNAAS) Content Management System, built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based authentication with role-based access control (SUPER_ADMIN, SECRETARY)
- **Student Management**: Complete CRUD operations for student records
- **Attendance System**: Mark attendance, track present/absent members, manage visitors
- **Data Export**: Export student data in multiple formats (PDF, Excel, CSV)
- **Reports & Analytics**: Generate comprehensive reports with real-time data
- **Admin Management**: Create and manage secretaries, batch student promotions

### Advanced Features
- **Profile Image Management**: Support for user profile images with automatic sync
- **Batch Operations**: Bulk student promotion and alumni status management
- **Real-time Statistics**: Live dashboard data with attendance insights
- **Email Integration**: Automated email notifications using Mailjet
- **Data Validation**: Comprehensive input validation and error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email Service**: Mailjet
- **PDF Generation**: jsPDF with autoTable
- **Excel Generation**: ExcelJS
- **CSV Processing**: Fast CSV
- **Environment Management**: dotenv

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gnaas-cms-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=gnaas_cms_dev
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # Email Configuration (Mailjet)
   MAILJET_API_KEY=your_mailjet_api_key
   MAILJET_SECRET_KEY=your_mailjet_secret_key
   MAILJET_FROM_EMAIL=your_from_email
   
   # Admin Seed Configuration
   SEED_ADMIN_EMAIL=admin@gnaas.local
   SEED_ADMIN_PASSWORD=admin123456
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb gnaas_cms_dev
   
   # Create database user (optional)
   psql -c "CREATE USER gnaas WITH PASSWORD 'your_password';"
   psql -c "GRANT ALL PRIVILEGES ON DATABASE gnaas_cms_dev TO gnaas;"
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## 📁 Project Structure

```
gnaas-cms-be/
├── src/
│   ├── bootstrap/          # Server initialization
│   ├── controllers/        # Request handlers
│   ├── entities/          # TypeORM database models
│   ├── middleware/        # Custom middleware
│   ├── routes/           # API route definitions
│   ├── data-source.ts    # Database configuration
│   └── index.ts          # Application entry point
├── dist/                 # Compiled JavaScript (production)
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### Core Entities

#### User Entity
- **Purpose**: Authentication and user management
- **Fields**: id, fullName, email, passwordHash, role, profileImageUrl, timestamps
- **Roles**: SUPER_ADMIN, SECRETARY

#### Student Entity
- **Purpose**: Student information and academic records
- **Fields**: id, code, fullName, email, phone, level, hall, gender, role, programDurationYears, dateOfAdmission, profileImageUrl, timestamps
- **Student Roles**: Member, Visitor

#### Attendance Entity
- **Purpose**: Daily attendance tracking
- **Fields**: id, studentId, date, isPresent, markedBy, timestamps

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/change-password` - Change user password

### Student Management
- `GET /students` - Get all students (with pagination, search, filters)
- `POST /students` - Create new student
- `PUT /students/:id` - Update student information
- `DELETE /students/:id` - Delete student
- `GET /students/next-code` - Get next student code

### Attendance Management
- `GET /attendance/summary` - Get attendance summary
- `GET /attendance/unmarked-members` - Get unmarked members
- `POST /attendance/mark-member` - Mark member attendance
- `POST /attendance/mark-visitor` - Add visitor
- `POST /attendance/close` - Close attendance session
- `GET /attendance/status` - Get attendance status
- `GET /attendance/members-present` - Get present members
- `GET /attendance/members-absent` - Get absent members
- `GET /attendance/visitors` - Get visitors
- `GET /attendance/weekly-stats` - Get weekly statistics
- `GET /attendance/monthly-trends` - Get monthly trends

### Admin Operations
- `GET /admin/users` - List all users
- `POST /admin/secretaries` - Create new secretary
- `POST /admin/sync-profile-images` - Sync profile images
- `POST /admin/promote-students` - Batch promote students
- `GET /admin/alumni-eligible` - Get alumni eligible count
- `GET /admin/attendance-insights` - Get attendance insights
- `GET /admin/gender-distribution` - Get gender distribution
- `GET /admin/hall-distribution` - Get hall distribution
- `GET /admin/available-levels` - Get available levels
- `GET /admin/valid-promotion-targets` - Get valid promotion targets

### Data Export
- `POST /export/students` - Export student data (PDF, Excel, CSV)
- `GET /export/filters` - Get export filter options

### Reports
- `GET /reports/attendance` - Attendance report
- `GET /reports/levels` - Level distribution report
- `GET /reports/halls` - Hall distribution report
- `GET /reports/gender` - Gender distribution report
- `GET /reports/monthly-trends` - Monthly trends report
- `GET /reports/export/:reportType` - Export specific report

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user_id",
  "role": "SUPER_ADMIN|SECRETARY",
  "iat": "issued_at",
  "exp": "expires_at"
}
```

### Role-Based Access Control
- **SUPER_ADMIN**: Full system access, can create secretaries, manage all data
- **SECRETARY**: Student management, attendance marking, limited admin functions

### Middleware
- `requireAuth`: Validates JWT token
- `requireRole`: Checks user role permissions

## 📊 Data Export Features

### Supported Formats
- **PDF**: Professional reports with tables and formatting
- **Excel**: Spreadsheet format with multiple sheets
- **CSV**: Comma-separated values for data analysis

### Export Options
- **Filters**: Date range, hall, level, gender, role, status, program duration, admission year
- **Include Options**: Personal info, contact info, attendance records
- **Custom Fields**: Select specific fields to include

## 📈 Analytics & Reporting

### Dashboard Statistics
- Total students count
- Present/absent members
- Visitors count
- Attendance rate

### Chart Data
- Attendance insights (6-month trend)
- Gender distribution
- Hall distribution
- Monthly attendance trends

### Report Types
- Daily attendance reports
- Weekly statistics
- Monthly trends
- Level-wise distribution
- Hall-wise distribution

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=4000
DB_HOST=your_production_db_host
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_production_jwt_secret
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 API Documentation

### Request/Response Examples

#### Login Request
```json
POST /auth/login
{
  "email": "admin@gnaas.local",
  "password": "admin123456"
}
```

#### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "admin@gnaas.local",
    "role": "SUPER_ADMIN",
    "fullName": "Super Admin",
    "profileImageUrl": "https://example.com/image.jpg"
  }
}
```

#### Create Student Request
```json
POST /students
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+233123456789",
  "studentId": "STU-2024-001",
  "level": "L100",
  "hall": "Legon",
  "gender": "Male",
  "role": "Member",
  "programDurationYears": 4,
  "dateOfAdmission": "2024-01-15",
  "profileImageUrl": "https://example.com/profile.jpg"
}
```

## 🔧 Development

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting

### Database Migrations
```bash
# Generate migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Debugging
```bash
# Debug mode
npm run dev:debug

# Logs
npm run logs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added profile image support and sync mechanism
- **v1.2.0** - Enhanced reporting and analytics features
- **v1.3.0** - Improved data export capabilities

---

**Built with ❤️ for GNAAS UG**