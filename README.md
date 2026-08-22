# 🛡️ HR Guard — AI-Driven Attendance Integrity & Payroll Protection System

> **Hackathon-Ready Production MVP**
> An AI-powered Human Resource Management & Payroll Protection System designed to detect attendance anomalies in real-time, safeguard organizational payroll against unauthorized overtime, and provide automated HR risk reviews.

---

## 1. Problem Statement
Traditional HR management systems treat attendance tracking and payroll processing as isolated administrative functions. This disconnection creates severe financial vulnerabilities:
- Unverified overtime claims and missed checkouts bloating payroll expenditures.
- Manual attendance fraud (buddy punching, duplicate scans).
- Attendance logged during active approved leave status going unnoticed.

## 2. The Solution: HR Guard Innovation Pipeline

```
Attendance Data ➔ AI Anomaly Engine ➔ Risk Score (0-100) ➔ HR Review ➔ Payroll Protection
```

HR Guard continuously scans attendance terminal events, calculates an **AI Risk Score**, automatically places high-risk payroll accounts on **HOLD FOR REVIEW**, and generates natural language executive summaries for HR action.

---

## 3. Key Features

- **🛡️ Automated Payroll Protection**: Prevents payroll disbursement whenever an employee has an unresolved High-Risk attendance anomaly.
- **🤖 AI Attendance Intelligence Engine**: Detects 5 critical anomaly types with real-time risk scoring (0-100).
- **🗣️ Natural Language AI Summaries**: Generates human-readable executive findings explaining why an anomaly was flagged.
- **📊 Role-Based Dashboards**: Customized views for **HR Admin**, **Manager**, and **Employee**.
- **⏱️ Live Check-In / Check-Out Station**: Real-time clocking station for employees with shift duration tracking.
- **👥 Employee Directory & Profile Management**: Complete CRUD operations, profile tabs, and attendance history.
- **🏖️ Leave Management System**: Interactive leave application, approval workflows, and leave-attendance conflict resolution.
- **📑 Comprehensive Reports & CSV Exporter**: Download raw CSV reports for Attendance, AI Anomalies, and Payroll Risk.

---

## 4. AI Anomaly Engine & Risk Scoring Matrix

| Anomaly Type | Condition | Score |
| :--- | :--- | :---: |
| **Missing Checkout** | Check-in logged without checkout timestamp | `+30` |
| **Excessive Overtime** | Recorded shift duration > 12.0 hours | `+25` |
| **Repeated Late Arrival** | 3+ consecutive check-ins after 09:30 AM | `+20` |
| **Attendance During Leave** | Active check-in on approved leave date | `+30` |
| **Duplicate Attendance** | Multiple check-in signals on same date | `+40` |

### Risk Level Scale:
- `0 – 29`: 🟢 **NORMAL**
- `30 – 59`: 🟡 **MEDIUM RISK**
- `60 – 100`: 🔴 **HIGH RISK** *(Triggers automatic `HOLD FOR REVIEW` status on Payroll)*

---

## 5. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide React icons, Recharts, React Router DOM, Axios.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`).
- **Database**: MySQL (`mysql2/promise`) with automatic zero-config In-Memory Database Fallback.

## 6. Installation & How to Run

### Step 1: Clone & Install Dependencies
```bash
# Root directory dependencies
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

### Step 2: Configure Environment Variables
A pre-configured `.env` file is located in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hr_guard
JWT_SECRET=hr_guard_hackathon_super_secret_key_2026
```

### Step 3: Run the Application
```bash
# From root directory, start Backend API:
npm run dev:backend

# From root directory (new terminal tab), start Frontend:
npm run dev:frontend
```

---

## 7. Demo Credentials for Hackathon

Quick clickable demo buttons are built directly into the Login page for seamless presentation:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **HR Admin** | `admin@hrguard.com` | `admin123` | Full access to Dashboard, Employees, AI Alerts, Payroll Release/Hold, Reports, Settings |
| **Manager** | `manager@hrguard.com` | `manager123` | Department team attendance, team leave approval, team AI alerts |
| **Employee** | `employee@hrguard.com` | `employee123` | Personal check-in/out station, personal leave application, own payroll status |

---

## 8. Hackathon Presentation Demo Workflow

Use this 60-second end-to-end interactive story during your hackathon pitch:

1. **Sign in as Employee** (`employee@hrguard.com` / `employee123`):
   - Navigate to Dashboard. Click **CHECK IN NOW** to log live attendance. Click **CHECK OUT NOW** to simulate shift completion.
2. **Sign in as HR Admin** (`admin@hrguard.com` / `admin123`):
   - Notice the **AI Anomalies (5)** and **Payroll At Risk (₹42,500)** KPI cards on the main dashboard.
3. **Inspect AI Alert Summary**:
   - Open **AI Intelligence** page (`/anomalies`). Locate **Rahul Kumar (EMP102)** with **Excessive Overtime (13h 42m duration)**, Score `87/100` (🔴 **HIGH RISK**).
4. **Open Anomaly Detail Page**:
   - Click **Review** to see the full AI investigation breakdown, exact clock timestamps, natural language findings, and recommendation.
5. **Verify Payroll Protection**:
   - Navigate to **Payroll Hub** (`/payroll`). Notice Rahul Kumar's status is locked to **`🔴 HOLD FOR REVIEW`**.
   - Attempting to click "Release" triggers **Payroll Protection Lock**.
6. **Resolve Anomaly & Unlock Payroll**:
   - Go back to Rahul Kumar's Anomaly Detail page and click **Resolve & Clear**.
   - Return to Payroll Hub: Rahul Kumar's status is automatically unlocked and updated to **`🟢 CLEARED`**.

---

## 9. Future Enhancements

- Geofencing and biometric facial recognition check-in validation.
- Direct banking portal API integration for automated salary payout upon HR clearing.
- Real-time Slack / WhatsApp notification alerts for high-risk payroll locks.
