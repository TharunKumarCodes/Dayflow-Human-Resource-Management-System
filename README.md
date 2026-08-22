# 🚀 Dayflow – AI-Powered Human Resource Management System

> **Every workday, perfectly aligned.**

Dayflow is an AI-powered Human Resource Management System designed to centralize employee management, attendance tracking, leave management, payroll visibility, HR approvals, notifications, analytics, and audit logging in a single platform.

The project's key innovation is **AI Attendance Integrity & Payroll Protection**, an explainable attendance anomaly detection system that identifies unusual attendance patterns, assigns a risk score, provides reasons for the anomaly, and routes the case to HR for review before it can affect payroll.

---

## 🎯 Problem Statement

Traditional HR operations often involve separate processes for employee information, attendance, leave requests, payroll, and HR approvals.

Dayflow brings these operations together into a centralized digital platform with:

* 🔐 Secure authentication
* 👥 Role-based access control
* 👤 Employee profile management
* 🕐 Attendance tracking
* 🏖️ Leave management
* 💰 Payroll management
* 🤖 Attendance anomaly detection
* 🔔 Notifications
* 📊 Analytics and reports
* 📝 Audit logging

---

# 💡 Our Solution

Dayflow provides two major user experiences:

### 👨‍💻 Employee

Employees can:

* Register and sign in
* View their dashboard
* View and manage permitted profile information
* Check in and check out
* View attendance history
* Apply for leave
* Track leave request status
* View payroll information
* View notifications

### 👩‍💼 HR / Admin

HR/Admin users can:

* View employee information
* Monitor attendance
* Review attendance anomalies
* Approve or reject leave requests
* Add HR comments
* Manage payroll information
* View analytics
* Review audit logs
* Receive anomaly notifications

---

# 🔥 Key Innovation

## AI Attendance Integrity & Payroll Protection

The core differentiator of Dayflow is its attendance integrity layer.

Instead of allowing attendance records to directly influence payroll without verification, Dayflow analyzes attendance behavior and identifies potentially abnormal records.

### Workflow

```text
Employee Check-In / Check-Out
              ↓
     Attendance Analysis
              ↓
      Risk Score Generation
              ↓
       Anomaly Detection
              ↓
      Explainable Reason
              ↓
          HR Review
              ↓
    Verified Attendance Record
              ↓
         Payroll Processing
```

### Example

An employee normally starts around 9:00 AM but repeatedly checks in significantly late and records unusually short working hours.

The system can generate:

```text
Risk Score: 78%
Risk Level: HIGH

Reasons:
• Significant late check-in
• Critically short work duration
• Deviation from employee's normal attendance pattern
```

The system does **not automatically punish the employee** based only on the anomaly score.

Instead, the anomaly is sent to HR for review.

This creates a **human-in-the-loop attendance verification workflow**.

---

# 🤖 Explainable Attendance Anomaly Engine

The current implementation uses an **explainable rule-based scoring engine**.

The engine evaluates:

### 1. Check-In Time

The system compares the check-in time against a 9:00 AM baseline.

Examples:

* Moderate lateness → risk increase
* Significant lateness → higher risk
* Extremely unusual check-in time → higher risk

### 2. Work Duration

The engine analyzes working duration.

Examples:

* Less than 7 hours → increased risk
* Less than 4 hours → significantly increased risk

### 3. Historical Behavior

The system analyzes recent attendance history and evaluates:

* Average check-in time
* Deviation from normal behavior
* Repeated lateness

The final score is capped at 99%.

### Risk Levels

| Risk Score | Level     |
| ---------: | --------- |
|      0–34% | 🟢 Low    |
|     35–59% | 🟡 Medium |
|     60–99% | 🔴 High   |

An attendance record is flagged as an anomaly when its score reaches the configured anomaly threshold.

> **Note:** The current implementation is an explainable rule-based engine. It is structured so that a future machine-learning model can replace or extend the scoring engine.

---

# 🧩 Main Features

## 🔐 Authentication

* Employee registration
* HR/Admin registration
* Login
* JWT-based authentication
* Password hashing using bcrypt
* Protected routes
* Role-based authorization
* Automatic session handling

---

## 👤 Employee Management

Employee profiles contain:

* Employee ID
* Name
* Email
* Phone
* Address
* Department
* Designation
* Joining date
* Salary information
* Profile image
* Documents

---

## 🕐 Attendance Management

Employees can:

* Check in
* Check out
* View attendance
* View working hours
* Track attendance status

Attendance supports statuses such as:

* Present
* Absent
* Half-day
* Leave
* Late

The system prevents duplicate attendance records for the same employee and date.

---

## 🏖️ Leave Management

Employees can apply for:

* Paid Leave
* Sick Leave
* Unpaid Leave

Each request contains:

* Leave type
* Start date
* End date
* Total days
* Reason
* Status

### Leave Status

```text
PENDING
APPROVED
REJECTED
```

HR can:

* View leave requests
* Approve requests
* Reject requests
* Add comments
* Review employee leave history

---

## 💰 Payroll Management

Payroll information includes:

* Basic salary
* Allowances
* Deductions
* Gross salary
* Net salary
* Pay period
* Payment status
* Attendance days
* Attendance anomaly holds

Employees can view their payroll information.

HR/Admin can view and manage payroll information.

The project also includes a **salary slip interface**.

---

## 🔔 Notifications

The notification system provides alerts for important events such as:

* Attendance anomalies
* Leave updates
* HR actions
* Payroll-related updates

HR users receive notifications when an attendance anomaly is detected.

---

## 📊 Analytics

The HR dashboard provides analytical views for:

* Employee statistics
* Attendance
* Leave information
* Payroll
* Attendance anomalies

Charts are implemented using **Recharts**.

---

## 📝 Audit Logs

Dayflow records important system activities.

Examples include:

* Employee creation
* Payroll generation
* System initialization
* HR actions

Audit logs help provide traceability for important HR operations.

---

# 🏗️ System Architecture

```text
                    ┌───────────────────────┐
                    │       Dayflow         │
                    │       HRMS            │
                    └───────────┬───────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
          Employee Portal                HR/Admin Portal
                 │                             │
                 └──────────────┬──────────────┘
                                │
                         React Frontend
                                │
                            REST APIs
                                │
                      Node.js + Express
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
              Prisma       JWT Auth       Anomaly Engine
                 │              │              │
                 └──────────────┼──────────────┘
                                │
                             SQLite
```

---

# 🛠️ Technology Stack

## Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts
* Lucide React

## Backend

* Node.js
* Express.js
* TypeScript
* JWT
* bcryptjs
* Zod
* CORS

## Database

* SQLite
* Prisma ORM

## Development

* Vite
* TypeScript
* ts-node
* ts-node-dev
* Concurrently

---

# 📁 Project Structure

```text
dayflow-hrms/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── package.json
└── README.md
```

---

# 🗄️ Database Models

The Prisma database contains the following major models:

```text
User
Employee
Attendance
AttendanceAnomaly
LeaveRequest
Payroll
Notification
AuditLog
Document
```

### Relationships

```text
User
 │
 └── Employee
       ├── Attendance
       ├── AttendanceAnomaly
       ├── LeaveRequest
       ├── Payroll
       └── Document

User
 └── Notification

AuditLog
 └── Records system actions
```

---

# 🔑 Demo Credentials

The project includes seeded demo accounts.

### HR / Admin

```text
Email: admin@dayflow.com
Password: admin123
Role: HR_ADMIN
```

### Employee

```text
Email: priya.sharma@dayflow.com
Password: password123
Role: EMPLOYEE
```

Additional employee accounts are included in the seed data.

> For production deployment, replace all demo credentials and secrets.

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd dayflow-hrms
```

---

## 2. Install dependencies

```bash
npm run install:all
```

---

## 3. Configure environment variables

Create:

```text
server/.env
```

Use the following structure:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secure_jwt_secret"
NODE_ENV="development"
```

---

## 4. Initialize the database

```bash
npm run db:push
```

---

## 5. Seed demo data

```bash
npm run db:seed
```

The seed process creates:

* HR/Admin account
* Employee accounts
* Employee profiles
* Attendance records
* Attendance anomalies
* Leave requests
* Payroll records
* Notifications
* Audit logs

---

# ▶️ Run the Application

### Run backend

```bash
npm run dev:server
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### Run frontend

In another terminal:

```bash
npm run dev:client
```

Vite will provide the local frontend URL.

### Run both together

```bash
npm run dev
```

---

# 🔌 API Modules

The backend is organized into REST API modules:

```text
/api/auth
/api/employees
/api/attendance
/api/anomalies
/api/leaves
/api/payroll
/api/notifications
/api/analytics
/api/audit-logs
```

The backend uses JWT authentication and role-based authorization for protected resources.

---

# 🔐 Security

Dayflow implements:

* JWT authentication
* Password hashing
* Protected frontend routes
* Backend authorization middleware
* Role-based access control
* Environment-based configuration
* API authentication headers
* Input validation
* Centralized error handling

Employees and HR/Admin users have different access permissions.

---

# 🧪 Demo Scenario

The seeded database contains realistic attendance data, including intentionally anomalous attendance records.

### Employee Flow

```text
Login
  ↓
Employee Dashboard
  ↓
Check In / Check Out
  ↓
View Attendance
  ↓
Apply for Leave
  ↓
Track Leave Status
  ↓
View Payroll
```

### HR Flow

```text
Login
  ↓
HR Dashboard
  ↓
View Employees
  ↓
Monitor Attendance
  ↓
Attendance Integrity Center
  ↓
Review Anomaly
  ↓
Approve / Correct / Request Explanation
  ↓
Review Payroll
  ↓
Analytics & Audit Logs
```

---

# 🏆 Why Dayflow?

Dayflow combines everyday HR operations with an additional attendance integrity layer.

### Traditional HRMS

```text
Attendance → Payroll
```

### Dayflow

```text
Attendance
     ↓
Behavior Analysis
     ↓
Anomaly Detection
     ↓
Risk Score
     ↓
Explanation
     ↓
HR Verification
     ↓
Payroll
```

This provides a transparent approach to handling potentially abnormal attendance records.

---

# 🔮 Future Enhancements

Potential future improvements include:

* Machine-learning-based anomaly detection
* Face verification for attendance
* Geolocation-based attendance validation
* Email verification
* Email notifications
* Real-time push notifications
* Advanced payroll automation
* Automated salary-slip PDF generation
* Department-level HR analytics
* Predictive employee insights
* Cloud deployment
* Multi-company support
* Mobile application

---

# 📌 Current Implementation Note

The current project implements the attendance intelligence feature using an **explainable rule-based anomaly scoring engine** based on:

* Check-in timing
* Work duration
* Historical attendance patterns
* Repeated lateness
* Deviation from typical attendance behavior

This approach is intentionally transparent and suitable for demonstrating the concept during the hackathon.

A future version can integrate a trained machine-learning model while retaining the existing HR review workflow.

---


# 📜 License

This project was developed as a hackathon project.

Add an appropriate open-source license if required by your hackathon or team.
