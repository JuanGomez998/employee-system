# System Architecture Diagram

## 🏗️ Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         EMPLOYEE CLOCK SYSTEM                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────── FRONTEND ─────────────────────────────────┐
│                                                                             │
│  Browser: http://localhost:5175                                            │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                         App.tsx (Router)                          │   │
│  │                                                                   │   │
│  │  ┌─────────────┬──────────────────┬─────────────────────┐       │   │
│  │  │             │                  │                     │       │   │
│  │  ▼             ▼                  ▼                     ▼       │   │
│  │  /         /admin/*           /admin/***          Navigation   │   │
│  │  Clock      Protected          Protected                       │   │
│  │  (Public)   (Admin Panel)      Routes                          │   │
│  │                                                                   │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │          ProtectedRoute Component                       │   │   │
│  │  │  Checks: isAuthenticated + userRole == "admin"         │   │   │
│  │  │  Redirects to / if not authenticated                   │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                   │   │
│  │  Pages/                                                          │   │
│  │  ├─ Clock.tsx          (Fullscreen, no sidebar)                │   │
│  │  ├─ Dashboard.tsx      (Wrapped in AdminLayout)               │   │
│  │  ├─ Employees.tsx      (Wrapped in AdminLayout)               │   │
│  │  ├─ Attendance.tsx     (Wrapped in AdminLayout)               │   │
│  │  ├─ Reports.tsx        (Wrapped in AdminLayout)               │   │
│  │  └─ Payroll.tsx        (Wrapped in AdminLayout)               │   │
│  │                                                                   │   │
│  │  AdminLayout Component:                                          │   │
│  │  ├─ Header (with logout button)                                │   │
│  │  ├─ Sidebar (navigation menu)                                  │   │
│  │  └─ Main (page content)                                        │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  utils/auth.ts:                                                           │
│  - login(username, password)      → token + user                          │
│  - getCurrentUser(token)          → user info                             │
│  - setToken() / getToken()        → localStorage                          │
│  - isAuthenticated()              → boolean                               │
│  - decodeToken()                  → JWT payload                           │
│                                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼ HTTP POST       ▼ HTTP GET       ▼
          /api/clock/punch      /api/clock/verify   /api/auth/me
                    │                 │                 │
┌─────────────────────────────────── BACKEND ─────────────────────────────────┐
│                                                                             │
│  Express Server: http://localhost:3000                                     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                      Middleware Stack                             │   │
│  │                                                                   │   │
│  │  cors() → express.json() → [authMiddleware] → Route Handlers    │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │  auth.ts (Middleware)                                      │ │   │
│  │  │  ─────────────────────────────────────────────────────── │ │   │
│  │  │  • authMiddleware                                         │ │   │
│  │  │    - Extracts JWT from Authorization header              │ │   │
│  │  │    - Verifies signature & expiration                     │ │   │
│  │  │    - Adds user object to req.user                        │ │   │
│  │  │    - Throws 401 if invalid                               │ │   │
│  │  │                                                           │ │   │
│  │  │  • adminMiddleware                                        │ │   │
│  │  │    - Checks req.user.role === "admin"                   │ │   │
│  │  │    - Throws 403 if not admin                            │ │   │
│  │  │                                                           │ │   │
│  │  │  • optionalAuthMiddleware                                │ │   │
│  │  │    - Sets user if token exists                          │ │   │
│  │  │    - Doesn't fail if no token                           │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │  Routes                                                    │ │   │
│  │  │  ─────────────────────────────────────────────────────── │ │   │
│  │  │                                                           │ │   │
│  │  │  PUBLIC ROUTES (no auth required):                       │ │   │
│  │  │  ┌──────────────────────────────────────────────────┐   │ │   │
│  │  │  │ POST   /api/clock/punch                          │   │ │   │
│  │  │  │ GET    /api/clock/verify/:employee_id           │   │ │   │
│  │  │  │ GET    /api/clock/status/:employee_id           │   │ │   │
│  │  │  │ POST   /api/auth/login                           │   │ │   │
│  │  │  └──────────────────────────────────────────────────┘   │ │   │
│  │  │                                                           │ │   │
│  │  │  PROTECTED ROUTES (auth + admin required):              │ │   │
│  │  │  ┌──────────────────────────────────────────────────┐   │ │   │
│  │  │  │ GET    /api/employees     [authMiddleware]       │   │ │   │
│  │  │  │                           [adminMiddleware]      │   │ │   │
│  │  │  │ POST   /api/attendance    [authMiddleware]       │   │ │   │
│  │  │  │                           [adminMiddleware]      │   │ │   │
│  │  │  │ GET    /api/payroll       [authMiddleware]       │   │ │   │
│  │  │  │                           [adminMiddleware]      │   │ │   │
│  │  │  │ GET    /api/auth/me       [authMiddleware]       │   │ │   │
│  │  │  └──────────────────────────────────────────────────┘   │ │   │
│  │  │                                                           │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                   │   │
│  │  Controllers:                                                    │   │
│  │  ├─ clock.controller.ts                                        │   │
│  │  │  - punchController()      → Check-in/out logic            │   │
│  │  │  - verifyEmployeeController()                             │   │
│  │  │  - getStatusController()                                  │   │
│  │  │                                                           │   │
│  │  ├─ auth.controller.ts                                        │   │
│  │  │  - loginController()      → Generate JWT token           │   │
│  │  │  - registerController()   → Create admin user            │   │
│  │  │  - getCurrentUserController()                            │   │
│  │  │                                                           │   │
│  │  └─ employee.controller.ts (protected)                       │   │
│  │     auth.controller.ts (protected)                           │   │
│  │     payroll.controller.ts (protected)                        │   │
│  │                                                                   │   │
│  │  Services:                                                       │   │
│  │  ├─ clock.service.ts                                          │   │
│  │  │  - getEmployeeByEmployeeId()                             │   │
│  │  │  - getTodayAttendance()                                  │   │
│  │  │  - checkIn()          → Create attendance record         │   │
│  │  │  - checkOut()         → Update & calculate hours         │   │
│  │  │                                                           │   │
│  │  ├─ auth.service.ts                                           │   │
│  │  │  - login()            → JWT token generation             │   │
│  │  │  - register()         → Create user                      │   │
│  │  │  - getUserById()                                         │   │
│  │  │                                                           │   │
│  │  └─ employee.service.ts (existing)                           │   │
│  │     payroll.service.ts (existing)                            │   │
│  │                                                                   │   │
│  │  Utils:                                                         │   │
│  │  ├─ jwt.ts                                                      │   │
│  │  │  - generateToken(payload)    → Signed JWT                │   │
│  │  │  - verifyToken(token)        → Decoded payload           │   │
│  │  │  - extractToken(header)      → Remove "Bearer "         │   │
│  │  │                                                           │   │
│  │  └─ colombianHolidays.ts (existing)                          │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────── DATABASE ────────────────────────────────┐
│                                                                             │
│  PostgreSQL: postgresql://localhost:5432/employee_system                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐      │
│  │ employees table                                                 │      │
│  │ ├─ id (PK)                                                      │      │
│  │ ├─ name                                                         │      │
│  │ ├─ email                                                        │      │
│  │ ├─ position                                                     │      │
│  │ └─ employee_id (UNIQUE) ← Clock system uses THIS              │      │
│  │                                                                 │      │
│  ├─ attendance table (NEW)                                         │      │
│  │ ├─ id (PK)                                                      │      │
│  │ ├─ employee_id (FK → employees.employee_id)                    │      │
│  │ ├─ attendance_date (DATE)                                       │      │
│  │ ├─ check_in_time (TIMESTAMP)                                   │      │
│  │ ├─ check_out_time (TIMESTAMP, nullable)                        │      │
│  │ ├─ total_hours (DECIMAL 5,2)  ← Auto-calculated              │      │
│  │ └─ UNIQUE(employee_id, attendance_date)                        │      │
│  │                                                                 │      │
│  └─ users table (NEW)                                              │      │
│  │ ├─ id (PK)                                                      │      │
│  │ ├─ username (UNIQUE)                                           │      │
│  │ ├─ email (UNIQUE)                                              │      │
│  │ ├─ password_hash                                               │      │
│  │ ├─ role ('admin' | 'employee')                                 │      │
│  │ ├─ employee_id (FK → employees.employee_id)                    │      │
│  │ └─ is_active (BOOLEAN)                                         │      │
│  │                                                                 │      │
│  └─ Other tables (existing)                                        │      │
│     • payroll_records                                              │      │
│     • reports                                                      │      │
│                                                                    │      │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow Examples

### ⏰ Clock In (First Punch)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Step 1: User Input                                                  │
│ Browser: enters "EMP000001" and clicks "Check In / Check Out" button│
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Step 2: Frontend API Call                                           │
│ POST http://localhost:3000/api/clock/punch                          │
│ {                                                                   │
│   "employee_id": "EMP000001"                                        │
│ }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Step 3: Backend Processing                                          │
│                                                                     │
│ clock.controller.punchController()                                 │
│  ├─ Validate: employee_id exists                                   │
│  ├─ Sanitize: employee_id = employee_id.toUpperCase()             │
│  ├─ Call: clockService.getEmployeeByEmployeeId()                  │
│  │   SELECT * FROM employees WHERE employee_id = 'EMP000001'      │
│  │                                                                 │
│  ├─ Get today's date                                              │
│  │   today = "2026-02-18"                                         │
│  │                                                                 │
│  ├─ Check: getTodayAttendance(employee_id, today)                 │
│  │   SELECT * FROM attendance WHERE employee_id = 'EMP000001'     │
│  │         AND attendance_date = '2026-02-18'                     │
│  │   Result: NULL (no record yet)                                 │
│  │                                                                 │
│  ├─ Since NULL → PERFORM CHECK-IN                                 │
│  │   clockService.checkIn('EMP000001', NOW())                     │
│  │                                                                 │
│  ├─ Database Insert:                                             │
│  │   INSERT INTO attendance (employee_id, attendance_date,        │
│  │                           check_in_time)                       │
│  │   VALUES ('EMP000001', '2026-02-18', '2026-02-18T08:01:30Z')  │
│  │   RETURNING *                                                  │
│  │   Result: id=123, check_in_time=08:01:30, check_out_time=NULL│
│  │                                                                 │
│  └─ Format success response                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Step 4: Backend Response (200 OK)                                  │
│ {                                                                   │
│   "success": true,                                                 │
│   "action": "check_in",                                           │
│   "message": "Welcome Juan! Check-in at 08:01 AM",               │
│   "data": {                                                        │
│     "employee": {                                                  │
│       "id": 1, "name": "Juan", "position": "Developer"           │
│     },                                                             │
│     "attendance": {                                                │
│       "id": 123,                                                   │
│       "check_in_time": "2026-02-18T08:01:30Z",                   │
│       "check_out_time": null                                      │
│     }                                                              │
│   }                                                                │
│ }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Step 5: Frontend Display                                           │
│ • Show green success flash animation                              │
│ • Display toast: "Welcome Juan! Check-in at 08:01 AM"            │
│ • Clear input field (prepare for next employee or next action)    │
│ • Show last result card: Employee name, position, time           │
└─────────────────────────────────────────────────────────────────────┘
```

### 👋 Clock Out (Second Punch)

```
┌─────────────────────────────────────────────────────────────────────┐
│ (Same employee enters ID again hours later)                        │
│ User enters: "EMP000001" and clicks button                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Backend Processing:                                                 │
│                                                                     │
│ ├─ getTodayAttendance('EMP000001', '2026-02-18')                  │
│ │  Result: {id: 123, check_in_time: 08:01:30, check_out_time: NULL}
│ │                                                                 │
│ ├─ Check: check_out_time EXISTS?                                  │
│ │  No → Proceed with CHECKOUT                                    │
│ │                                                                 │
│ ├─ Calculate hours:                                              │
│ │  checkOutTime = 16:45:15                                       │
│ │  checkInTime = 08:01:30                                        │
│ │  diff = 28,425 seconds = 8 hours 45 min                        │
│ │  totalHours = 8.75 (rounded to 2 decimals)                     │
│ │                                                                 │
│ ├─ Database Update:                                              │
│ │  UPDATE attendance SET check_out_time = '16:45:15',            │
│ │                      total_hours = 8.75                        │
│ │  WHERE id = 123                                                │
│ │  RETURNING *                                                   │
│ │                                                                 │
│ └─ Format response with totalHours                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Response (200 OK):                                                 │
│ {                                                                   │
│   "success": true,                                                 │
│   "action": "check_out",                                          │
│   "message": "Check-out registered! Total hours: 8.75h",         │
│   "data": {                                                        │
│     "employee": {...},                                            │
│     "attendance": {                                                │
│       "check_in_time": "08:01:30",                               │
│       "check_out_time": "16:45:15",                              │
│       "total_hours": 8.75                                         │
│     }                                                              │
│   }                                                                │
│ }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Frontend Display:                                                   │
│ • Green success flash                                             │
│ • Toast: "Check-out registered! Total hours: 8.75h"             │
│ • Display: Employee worked 8 hours 45 minutes today              │
│ • Show in result card with total_hours                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow (Admin Login)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Admin Login (Future Implementation)                                │
│                                                                     │
│ 1. User navigates to /login (or admin panel tries to access)      │
│ 2. Form: username + password                                      │
│ 3. POST /api/auth/login {username, password}                      │
│                                                                     │
│ Backend:                                                            │
│ ├─ Query: SELECT * FROM users WHERE username = $1                │
│ ├─ Compare password (plain text for now, bcrypt in prod)         │
│ ├─ If match:                                                      │
│ │  └─ generateToken({id, username, email, role})               │
│ │     └─ Sign with SECRET_KEY                                    │
│ │     └─ Expires in 24 hours                                     │
│ ├─ Return: {token: "eyJhbGc...", user: {...}}                   │
│ │                                                                 │
│ Frontend:                                                           │
│ ├─ Receive token                                                   │
│ ├─ localStorage.setItem('auth_token', token)                     │
│ ├─ Update state: isAuthenticated = true                          │
│ ├─ Navigate to /admin/dashboard                                  │
│ │                                                                 │
│ Protected Routes:                                                  │
│ ├─ getToken() → Send in Authorization header                     │
│ ├─ Backend verifies: verifyToken(token)                          │
│ ├─ Adds req.user to request                                      │
│ ├─ Allows access to /admin routes                               │
│ │                                                                 │
│ Logout:                                                            │
│ ├─ Click "Logout" button                                         │
│ ├─ localStorage.removeItem('auth_token')                         │
│ ├─ setIsAuthenticated(false)                                     │
│ └─ Navigate to / (Clock interface)                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Examples in Database

### Attendance Records (Multiple Employees, One Day)

```
attendance table on 2026-02-18:

id  | employee_id | attendance_date | check_in_time       | check_out_time      | total_hours
────┼─────────────┼─────────────────┼─────────────────────┼─────────────────────┼────────────
1   | EMP000001   | 2026-02-18      | 08:01:30            | 16:45:15            | 8.73
2   | EMP000002   | 2026-02-18      | 09:15:00            | 17:30:45            | 8.26
3   | EMP000003   | 2026-02-18      | 07:45:20            | 16:00:00            | 8.24
4   | EMP000001   | 2026-02-19      | 08:03:15            | NULL                | NULL
```

### Users Table

```
users table:

id  | username | email              | password_hash | role    | employee_id | is_active
────┼──────────┼────────────────────┼───────────────┼─────────┼─────────────┼───────────
1   | admin    | admin@company.com  | password      | admin   | EMP000001   | true
2   | manager1 | manager@com.com    | password      | admin   | EMP000002   | true
3   | user1    | user@company.com   | password      | employee| EMP000003   | true
```

---

## 🎯 State Management (Frontend)

```javascript
// App.tsx maintains:
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [user, setUser] = useState(null);  // {id, username, email, role}
const [loading, setLoading] = useState(true);
const [darkMode, setDarkMode] = useState(true);

// On load:
// 1. Check localStorage for token
// 2. If exists, verify it's not expired
// 3. Fetch user details
// 4. If valid, set isAuthenticated = true

// On login (future):
// 1. POST /api/auth/login
// 2. Get token from response
// 3. Save to localStorage
// 4. Decode & set user state
// 5. setIsAuthenticated(true)

// On logout:
// 1. Remove token from localStorage
// 2. Clear user state
// 3. setIsAuthenticated(false)
// 4. Navigate to /
```

---

This architecture ensures:
✅ **Security**: JWT tokens, role-based access, input validation
✅ **Scalability**: Modular components, separated concerns
✅ **Maintainability**: Clear file organization, documented flows
✅ **User Experience**: Fast, responsive, intuitive interfaces
✅ **Data Integrity**: Database constraints, transaction safety
