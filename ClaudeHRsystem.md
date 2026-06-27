# ClaudeHRsystem — Project Documentation

> HR Management System for អគ្គាធិការដ្ឋាន (General Commissariat of National Police)
> Ministry of Interior, Kingdom of Cambodia
> Built by Claude Sonnet 4.6 — June 2026

---

## 1. Project Overview

A minimal HR system designed to digitize the monthly staff list (បញ្ជីបច្ចុប្បន្នភាព) of the General Commissariat. Version 1 covers CRUD operations only — no payroll or attendance tracking yet.

**Total staff in source document:** 419 employees (48 female)
- នគរបាល (Police): 333 (36 female)
- រដ្ឋបាលស៊ីវិល (Civil servants): 80 (09 female)
- ជាប់កិច្ចសន្យា (Contract staff): 06 (03 female)

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React.js | 18.x |
| Frontend Build Tool | Vite | 6.x |
| Frontend Styling | Tailwind CSS | 3.x |
| Frontend Routing | React Router DOM | 6.x |
| Frontend HTTP Client | Axios | 1.x |
| Frontend Forms | React Hook Form | 7.x |
| Frontend Notifications | React Hot Toast | 2.x |
| Date Utilities | date-fns | 4.x |
| Khmer Font | Noto Sans Khmer (Google Fonts) | — |
| Backend Runtime | Node.js + Express.js | 4.x |
| ORM | Prisma | 5.x |
| Database | SQLite (dev) → PostgreSQL (prod) | — |
| Authentication | JWT (jsonwebtoken) | 9.x |
| Password Hashing | bcryptjs | 2.x |
| CORS | cors | 2.x |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│         http://localhost:5173                       │
│                                                     │
│  React + Vite + Tailwind CSS                        │
│  ├── AuthContext (JWT stored in localStorage)       │
│  ├── React Router (client-side routing)             │
│  └── Axios (API calls with Bearer token)            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST API
                       ▼
┌─────────────────────────────────────────────────────┐
│                   BACKEND                           │
│         http://localhost:5000                       │
│                                                     │
│  Node.js + Express.js                               │
│  ├── JWT Auth Middleware                            │
│  ├── Role-based Access Control                      │
│  └── REST Controllers (CRUD)                        │
└──────────────────────┬──────────────────────────────┘
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│                  DATABASE                           │
│                                                     │
│  SQLite  →  backend/prisma/dev.db                   │
│  (switch to PostgreSQL for production)              │
└─────────────────────────────────────────────────────┘
```

---

## 4. Project Folder Structure

```
HRSYSTEM/
├── ClaudeHRsystem.md               ← This file
├── README.md                       ← Quick start guide
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           ← Database schema (all models)
│   │   ├── seed.js                 ← Initial data (users, ranks, depts)
│   │   └── dev.db                  ← SQLite database file (auto-generated)
│   ├── src/
│   │   ├── index.js                ← Express server entry point
│   │   ├── lib/
│   │   │   └── prisma.js           ← Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  ← JWT verify + role guard
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── employee.controller.js
│   │   │   ├── department.controller.js
│   │   │   ├── office.controller.js
│   │   │   ├── rank.controller.js
│   │   │   └── education.controller.js
│   │   └── routes/
│   │       ├── auth.routes.js
│   │       ├── employee.routes.js
│   │       ├── department.routes.js
│   │       ├── office.routes.js
│   │       ├── rank.routes.js
│   │       └── education.routes.js
│   ├── .env                        ← DATABASE_URL, JWT_SECRET, PORT
│   └── package.json
│
└── frontend/
    ├── index.html                  ← Khmer lang, Noto Sans Khmer font
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx                ← React DOM entry point
        ├── App.jsx                 ← Router + AuthProvider + all routes
        ├── index.css               ← Tailwind + custom component classes
        ├── context/
        │   └── AuthContext.jsx     ← Global auth state (user, login, logout)
        ├── services/
        │   └── api.js              ← Axios instance + all API functions
        ├── components/
        │   ├── Layout.jsx          ← App shell (sidebar + header + outlet)
        │   ├── Sidebar.jsx         ← Navigation sidebar (Khmer labels)
        │   └── PrivateRoute.jsx    ← Redirect to /login if not authenticated
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── employees/
            │   ├── EmployeeList.jsx
            │   ├── EmployeeForm.jsx
            │   └── EmployeeDetail.jsx
            ├── departments/
            │   └── DepartmentList.jsx
            └── settings/
                └── Settings.jsx
```

---

## 5. Database Schema

### Users
| Column | Type | Notes |
|---|---|---|
| id | Int (PK) | Auto-increment |
| name | String | Display name |
| email | String (unique) | Login email |
| password | String | bcrypt hashed |
| role | String | ADMIN / HR / VIEWER |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Employees
| Column | Type | Notes |
|---|---|---|
| id | Int (PK) | Auto-increment |
| sequentialNo | Int? | លរ. from PDF |
| khmerLastName | String | នាមត្រកូល |
| khmerFirstName | String | នាមខ្លួន |
| latinName | String | e.g. EM VICHET |
| gender | String | MALE / FEMALE |
| badgeNumber | String? | អត្តលេខ |
| dateOfBirth | DateTime | ថ្ងៃខែឆ្នាំកំណើត |
| retirementDate | DateTime? | ថ្ងៃចូលនិវត្តន៍ (DOB + 60 years) |
| position | String | មុខតំណែងបច្ចុប្បន្ន |
| rankId | Int? | FK → Rank |
| departmentId | Int? | FK → Department |
| officeId | Int? | FK → Office |
| educationLevelId | Int? | FK → EducationLevel |
| phone | String? | លេខទូរស័ព្ទ |
| remarks | String? | ផ្សេងៗ (supervisor name) |
| employeeType | String | POLICE / CIVIL / CONTRACT |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Departments
| Column | Type | Notes |
|---|---|---|
| id | Int (PK) | |
| nameKh | String | Khmer name |
| nameEn | String? | English name |
| order | Int | Display order |

### Offices
| Column | Type | Notes |
|---|---|---|
| id | Int (PK) | |
| nameKh | String | |
| nameEn | String? | |
| order | Int | |
| departmentId | Int (FK) | Parent department |

### Ranks
| Column | Type | Notes |
|---|---|---|
| id | Int (PK) | |
| nameKh | String | e.g. ឯកឧត្តម |
| nameEn | String? | e.g. His Excellency |
| rankType | String | MILITARY / CIVIL |
| order | Int | Display order |

### EducationLevels
| Column | Type | Notes |
|---|---|---|
| id | Int (PK) | |
| nameKh | String | e.g. អនុបណ្ឌិត |
| nameEn | String? | e.g. Master's Degree |
| order | Int | |

---

## 6. API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Login, returns JWT token |
| GET | /api/auth/me | All roles | Get current logged-in user |

### Employees
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/employees | All roles | List with search, filter, pagination |
| GET | /api/employees/stats | All roles | Dashboard statistics |
| GET | /api/employees/:id | All roles | Get one employee |
| POST | /api/employees | ADMIN, HR | Create employee |
| PUT | /api/employees/:id | ADMIN, HR | Update employee |
| DELETE | /api/employees/:id | ADMIN only | Delete employee |

### Departments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/departments | All roles | List all (includes offices + count) |
| GET | /api/departments/:id | All roles | Get one |
| POST | /api/departments | ADMIN, HR | Create |
| PUT | /api/departments/:id | ADMIN, HR | Update |
| DELETE | /api/departments/:id | ADMIN only | Delete |

### Offices
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/offices?departmentId= | All roles | List (filterable by dept) |
| POST | /api/offices | ADMIN, HR | Create |
| PUT | /api/offices/:id | ADMIN, HR | Update |
| DELETE | /api/offices/:id | ADMIN only | Delete |

### Ranks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/ranks | All roles | List all |
| POST | /api/ranks | ADMIN only | Create |
| PUT | /api/ranks/:id | ADMIN only | Update |
| DELETE | /api/ranks/:id | ADMIN only | Delete |

### Education Levels
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/education-levels | All roles | List all |
| POST | /api/education-levels | ADMIN only | Create |
| PUT | /api/education-levels/:id | ADMIN only | Update |
| DELETE | /api/education-levels/:id | ADMIN only | Delete |

---

## 7. Role-Based Access Control

| Feature | ADMIN | HR | VIEWER |
|---|---|---|---|
| View employees | ✅ | ✅ | ✅ |
| Add employee | ✅ | ✅ | ❌ |
| Edit employee | ✅ | ✅ | ❌ |
| Delete employee | ✅ | ❌ | ❌ |
| Manage departments | ✅ | ✅ | View only |
| Manage offices | ✅ | ✅ | View only |
| Manage ranks | ✅ | ❌ | View only |
| Manage education levels | ✅ | ❌ | View only |
| View dashboard | ✅ | ✅ | ✅ |

---

## 8. Pages & Features

### Login Page (`/login`)
- Email + password form
- JWT stored in localStorage on success
- Khmer error messages

### Dashboard (`/`)
- Total headcount card
- Breakdown by employee type (Police / Civil / Contract)
- Gender ratio with progress bars
- Per-department headcount list

### Employee List (`/employees`)
- Paginated table (20 per page)
- Search by name (Khmer or Latin), badge number, phone
- Filter by department, gender, employee type
- Shows rank, position, department, type badge, date of birth
- Add / Edit / Delete actions (role-restricted)

### Employee Add/Edit Form (`/employees/new`, `/employees/:id/edit`)
- Personal info: Khmer name, Latin name, gender, badge number, DOB, phone
- Auto-calculates retirement date from DOB (DOB + 60 years)
- Job info: employee type, rank (grouped Military/Civil), position (with datalist suggestions), department, office (filtered by department), education level, remarks
- Latin name auto-uppercased

### Employee Detail (`/employees/:id`)
- Full profile view in two-column layout
- Edit and Delete buttons (role-restricted)

### Departments (`/departments`)
- Collapsible accordion: Department → Offices
- Employee count per department and office
- Add/Edit/Delete departments and offices via modal dialogs

### Settings (`/settings`)
- Manage ranks (ADMIN only) — name in Khmer + English, type (Military/Civil)
- Manage education levels (ADMIN only)

---

## 9. Pre-seeded Data

### Departments (7 from PDF)
1. ថ្នាក់ដឹកនាំ អគ្គាធិការដ្ឋាន
2. នាយកដ្ឋានរដ្ឋបាល
3. នាយកដ្ឋានអធិការកិច្ចកិច្ចការរដ្ឋបាល
4. នាយកដ្ឋានទទួលពាក្យបណ្តឹង និងអង្កេតស្រាវជ្រាវកិច្ចការរដ្ឋបាល
5. នាយកដ្ឋានអធិការកិច្ចកិច្ចការនគរបាលថ្នាក់កណ្តាល
6. នាយកដ្ឋានអធិការកិច្ចកិច្ចការនគរបាលរាជធានីភ្នំពេញ
7. នាយកដ្ឋានទទួលពាក្យបណ្ឹង និងអង្កេតស្រាវជ្រាវកិច្ចការនគរបាល

### Military Ranks (12)
ឯកឧត្តម, ឧត្តមសេនីយ៍ឯក, ឧត្តមសេនីយ៍ទោ, ឧត្តមសេនីយ៍ត្រី,
វរសេនីយ៍ឯក, វរសេនីយ៍ទោ, វរសេនីយ៍ត្រី,
អនុសេនីយ៍ឯក, អនុសេនីយ៍ទោ, អនុសេនីយ៍ត្រី,
ព្រឹទ្ធបុរសឯក, ព្រឹទ្ធបុរសទោ

### Civil Ranks (3)
លោក, លោកស្រី, ព្រឹទ្ធបុរស

### Education Levels (12)
អនុបណ្ឌិត, បរិញ្ញាបត្រ, បរិញ្ញាបត្ររង, បរិញ្ញាបត្រគ្រប់គ្រង,
ទុតិយភូមិ, មធ្យម.កំរិត២, ថ្នាក់ទី១២, ថ្នាក់ទី១២ងីម,
ថ្នាក់ទី១០ងីម, ថ្នាក់ទី៩, ថ្នាក់ទី៨ងីម, ថ្នាក់ទី៥

### Default Users (2)
| Email | Password | Role |
|---|---|---|
| admin@hrsystem.gov.kh | admin123 | ADMIN |
| hr@hrsystem.gov.kh | hr123456 | HR |

---

## 10. How to Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # Starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # Starts on http://localhost:5173
```

### First-time Setup (already done)
```bash
cd backend
npm run db:push    # Creates SQLite tables
npm run db:seed    # Inserts initial data
```

---

## 11. What's NOT in v1 (Future Roadmap)

| Feature | Status |
|---|---|
| Payroll calculation | Planned v2 |
| Attendance tracking | Planned v2 |
| Leave / time-off requests | Planned v2 |
| Export to PDF (monthly report format) | Planned v2 |
| Export to Excel | Planned v2 |
| User management UI | Planned v2 |
| Bulk import from PDF/Excel | Planned v2 |
| Audit log (who changed what) | Planned v3 |
| PostgreSQL migration (production) | When deploying |

---

## 12. Environment Variables

**backend/.env**
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="hrsystem_jwt_secret_key_2026"
PORT=5000
```

---

*Document generated: June 2026*
*System built with Claude Sonnet 4.6*
