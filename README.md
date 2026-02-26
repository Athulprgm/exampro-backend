# ExamSeatPro Backend

Complete backend API for the ExamSeatPro exam seat arrangement management system.

## Features

- 🔐 **JWT Authentication** - Secure login and token-based authentication
- 👥 **Role-Based Access Control** - Admin, Teacher, and Student roles
- 🏢 **Multi-College Support** - Each college has isolated data
- 📚 **Department & Subject Management** - Organize academic structure
- 👨‍🎓 **Student & Teacher Management** - Complete user management
- 🏛️ **Room & Building Management** - Facility tracking with map coordinates
- 📝 **Exam Management** - Schedule and manage examinations
- 💺 **Seat Arrangement** - Automated seat allocation system
- 🚨 **Malpractice Reporting** - Report and track exam violations
- 🗺️ **Building Map** - Interactive map for navigation

## Tech Stack

- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Express Validator** - Input validation

## Installation

1. **Clone the repository**

```bash
cd Backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

4. **Start MongoDB**

Make sure MongoDB is running on your system.

5. **Run the server**

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Colleges

- `POST /api/colleges/register` - Register new college (Public)
- `GET /api/colleges/:id` - Get college details
- `PUT /api/colleges/:id` - Update college (Admin)

### Departments

- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department (Admin)
- `PUT /api/departments/:id` - Update department (Admin)
- `DELETE /api/departments/:id` - Delete department (Admin)

### Subjects

- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/department/:departmentId` - Get subjects by department
- `POST /api/subjects` - Create subject (Admin)
- `PUT /api/subjects/:id` - Update subject (Admin)
- `DELETE /api/subjects/:id` - Delete subject (Admin)

### Students

- `GET /api/students` - Get all students
- `POST /api/students` - Create student (Admin/Teacher)
- `PUT /api/students/:id` - Update student (Admin/Teacher)
- `DELETE /api/students/:id` - Delete student (Admin)

### Teachers

- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher (Admin)
- `PUT /api/teachers/:id` - Update teacher (Admin)
- `DELETE /api/teachers/:id` - Delete teacher (Admin)

### Rooms

- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room (Admin)
- `PUT /api/rooms/:id` - Update room (Admin)
- `DELETE /api/rooms/:id` - Delete room (Admin)

### Exams

- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams` - Create exam (Admin)
- `PUT /api/exams/:id` - Update exam (Admin)
- `DELETE /api/exams/:id` - Delete exam (Admin)

### Seat Arrangements

- `GET /api/seats/exam/:examId` - Get arrangement by exam
- `POST /api/seats` - Create arrangement (Admin)
- `PUT /api/seats/:id` - Update arrangement (Admin)
- `DELETE /api/seats/:id` - Delete arrangement (Admin)

### Malpractice

- `GET /api/malpractice` - Get all reports (Admin/Teacher)
- `GET /api/malpractice/search` - Search student
- `POST /api/malpractice` - Report malpractice (Admin/Teacher)
- `PUT /api/malpractice/:id` - Update report (Admin)
- `DELETE /api/malpractice/:id` - Delete report (Admin)

### Building Maps

- `GET /api/maps` - Get building map
- `POST /api/maps` - Save/update map (Admin)
- `DELETE /api/maps` - Delete map (Admin)

## Project Structure

```
Backend/
├── controllers/         # Request handlers
├── models/             # Mongoose schemas
├── routes/             # API routes
├── middleware/         # Custom middleware
├── server.js           # Entry point
├── package.json        # Dependencies
└── .env.example        # Environment template
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- College-level data isolation
- Input validation
- Helmet security headers
- CORS configuration

## License

MIT
