# ClaudeHRsystem — Project Documentation

> HR Management System for អគ្គាធិការដ្ឋាន (General Commissariat of National Police)
> Ministry of Interior, Kingdom of Cambodia
> Built by Claude Sonnet 4.6 — June 2026

---

## 1. Project Overview

A minimal HR system designed to digitize the monthly staff list (បញ្ជីបច្ចុប្បន្នភាព) of the General Commissariat. Version 1 covers CRUD operations, activity tracking, and a live dashboard — no payroll or attendance tracking yet.

**Total staff imported:** 419 employees (48 female)
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
| Frontend Notifications | React Hot Toast | 2.x |
| Date Utilities | date-fns | 4.x |
| Khmer Font | Noto Sans Khmer (Google Fonts) | — |
| Backend Runtime | Node.js + Express.js | 4.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL (Supabase) | — |
| Authentication | JWT (jsonwebtoken) | 9.x |
| Password Hashing | bcryptjs | 2.x |

---

## 3. System Architecture

**Local development:**
```
┌─────────────────────────────────────────────────────┐
│  BROWSER  —  http://localhost:5173                  │
│  React + Vite + Tailwind CSS                        │
│  AuthContext (JWT in localStorage) + Axios          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP REST API
                       ▼
┌─────────────────────────────────────────────────────┐
│  BACKEND  —  http://localhost:5000                  │
│  Node.js + Express.js                               │
│  JWT Auth Middleware + Role-based Access Control    │
└──────────────────────┬──────────────────────────────┘
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│  DATABASE  —  backend/prisma/dev.db  (SQLite)       │
└─────────────────────────────────────────────────────┘
```

**Production:**
```
┌─────────────────────────────────────────────────────┐
│  BROWSER                                            │
│  https://frontend-swart-chi-49.vercel.app           │
│  React (built by Vite, hosted on Vercel free tier)  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS REST API
                       ▼
┌─────────────────────────────────────────────────────┐
│  BACKEND                                            │
│  https://hrsystem-nkcm.onrender.com                 │
│  Node.js + Express (native Node on Render free tier)│
└──────────────────────┬──────────────────────────────┘
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│  DATABASE                                           │
│  PostgreSQL on Supabase (ap-southeast-2, Sydney)    │
│  Persistent — survives all redeploys                │
└─────────────────────────────────────────────────────┘
```

---

## 4. Project Folder Structure

```
HRSYSTEM/
├── ClaudeHRsystem.md               ← This file
├── README.md                       ← Quick start guide
├── package.json                    ← Root (node engine spec for Render)
├── .gitignore
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           ← All database models
│   │   ├── seed.js                 ← Seeds Supabase on first deploy (skips if data exists)
│   │   └── backup.json             ← Full export: 7 depts, 419 employees, ref data
│   ├── src/
│   │   ├── index.js                ← Express server entry point
│   │   ├── lib/
│   │   │   └── prisma.js           ← Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  ← JWT verify + role guard
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── employee.controller.js
│   │   │   ├── activityLog.controller.js
│   │   │   ├── department.controller.js
│   │   │   ├── office.controller.js
│   │   │   ├── rank.controller.js
│   │   │   └── education.controller.js
│   │   └── routes/
│   │       ├── auth.routes.js
│   │       ├── employee.routes.js
│   │       ├── activityLog.routes.js
│   │       ├── department.routes.js
│   │       ├── office.routes.js
│   │       ├── rank.routes.js
│   │       └── education.routes.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx                 ← Router + AuthProvider + all routes
        ├── index.css               ← Tailwind base + component classes
        ├── context/
        │   └── AuthContext.jsx     ← Global auth state (user, login, logout)
        ├── services/
        │   └── api.js              ← Axios instance + all API calls
        ├── components/
        │   ├── Layout.jsx          ← App shell (sidebar + header)
        │   ├── Sidebar.jsx         ← Navigation (Khmer labels)
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

### Employees
| Column | Type | Notes |
|---|---|---|
| id | Int (PK) | Auto-increment |
| sequentialNo | Int? | លរ. from original PDF |
| khmerLastName | String | នាមត្រកូល |
| khmerFirstName | String | នាមខ្លួន |
| latinName | String | e.g. EM VICHET |
| gender | String | MALE / FEMALE |
| badgeNumber | String? | អត្តលេខ (exact match search) |
| dateOfBirth | DateTime | ថ្ងៃខែឆ្នាំកំណើត |
| retirementDate | DateTime? | DOB + 60 years (auto-calculated) |
| position | String | មុខតំណែងបច្ចុប្បន្ន |
| rankId | Int? | FK → Rank |
| departmentId | Int? | FK → Department |
| officeId | Int? | FK → Office |
| educationLevelId | Int? | FK → EducationLevel |
| phone | String? | លេខទូរស័ព្ទ |
| remarks | String? | ផ្សេងៗ |
| employeeType | String | POLICE / CIVIL / CONTRACT |

### ActivityLog
| Column | Type | Notes |
|---|---|---|
| id | Int (PK) | Auto-increment |
| employeeId | Int? | FK → Employee (nullable, preserved after deletion) |
| employeeName | String | Stored at time of change |
| employeeDept | String? | Department name at time of change |
| userId | Int? | FK → User who made the change |
| userName | String? | Stored at time of change |
| changeType | String | PROMOTION / TRANSFER / UPDATE / CREATE / DELETE |
| field | String? | Which field changed (position, rank, department, office, employeeType) |
| oldValue | String? | Human-readable previous value |
| newValue | String? | Human-readable new value |
| createdAt | DateTime | Auto |

### Departments / Offices / Ranks / EducationLevels
Standard lookup tables — id, nameKh, nameEn, order, with appropriate FK relations.

---

## 6. API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | All | Get current user |

### Employees
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/employees | All | List — search, filter, paginate |
| GET | /api/employees/stats | All | Dashboard counts |
| GET | /api/employees/:id | All | Single employee |
| POST | /api/employees | ADMIN, HR | Create (logs CREATE) |
| PUT | /api/employees/:id | ADMIN, HR | Update (logs diffs) |
| DELETE | /api/employees/:id | ADMIN | Delete (logs DELETE) |

### Activity Logs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/activity-logs?limit=20 | All | Recent activity feed |

### Departments / Offices / Ranks / Education Levels
Standard CRUD — GET (all roles), POST/PUT (ADMIN+HR), DELETE (ADMIN only).

---

## 7. Role-Based Access Control

| Feature | ADMIN | HR | VIEWER |
|---|---|---|---|
| View employees | ✅ | ✅ | ✅ |
| Add / Edit employee | ✅ | ✅ | ❌ |
| Delete employee | ✅ | ❌ | ❌ |
| Manage departments & offices | ✅ | ✅ | View only |
| Manage ranks & education | ✅ | ❌ | View only |
| View dashboard & activity | ✅ | ✅ | ✅ |

---

## 8. Pages & Features

### Login (`/login`)
- Email + password, JWT stored in localStorage, Khmer error messages

### Dashboard (`/`)
- **4 stat cards** — total, Police, Civil, Contract (with % pill)
- **Gender card** — SVG donut chart (blue = male, pink = female), no chart library
- **Department list** — 2-column clickable grid, each row links to `/employees?departmentId=X`
- **Activity feed** — last 15 changes, shows employee name + department, change type icon, old → new value, admin name, date + time (`DD/MM/YYYY HH:MM`)

### Employee List (`/employees`)
- Paginated table (20 per page)
- Search: name (Khmer or Latin) and badge number (exact match only)
- Filter: department, office (ការិយាល័យទាំងអស់), gender, employee type
- Accepts `?departmentId=` URL param (used by Dashboard department links)
- Column header: "ថ្ងៃខែឆ្នាំកំណើត"

### Employee Add/Edit Form (`/employees/new`, `/employees/:id/edit`)
- Personal: Khmer name, Latin name (auto-uppercase), gender, badge, DOB, phone
- Retirement date auto-calculated (DOB + 60 years)
- Job: type, rank grouped as "មន្រ្តីនគរបាល" / "ស៊ីវិល", position (datalist suggestions), department, office, education level
- Every save automatically writes to ActivityLog

### Employee Detail (`/employees/:id`)
- Two-column profile view, Edit + Delete (role-restricted)

### Departments (`/departments`)
- Accordion: Department → Offices, employee count per level
- Add/Edit/Delete via modals

### Settings (`/settings`)
- Ranks: Khmer + English name, type badge shows "មន្រ្តីនគរបាល" or "ស៊ីវិល"
- Education levels

---

## 9. Activity Tracking

Every employee create, update, and delete is automatically recorded. Tracked change types:

| changeType | Trigger | Icon |
|---|---|---|
| PROMOTION | position or rank changed | 📈 |
| TRANSFER | department or office changed | 🏢 |
| UPDATE | employeeType changed | ✏️ |
| CREATE | new employee added | ➕ |
| DELETE | employee removed | 🗑️ |

Name, department, and admin are stored at time of change so the log remains readable even after an employee is deleted or transferred.

---

## 10. Pre-seeded Data

### Departments (7)
1. ថ្នាក់ដឹកនាំ អគ្គាធិការដ្ឋាន
2. នាយកដ្ឋានរដ្ឋបាល
3. នាយកដ្ឋានអធិការកិច្ចកិច្ចការរដ្ឋបាល
4. នាយកដ្ឋានទទួលពាក្យបណ្តឹង និងអង្កេតស្រាវជ្រាវកិច្ចការរដ្ឋបាល
5. នាយកដ្ឋានអធិការកិច្ចកិច្ចការនគរបាលថ្នាក់កណ្តាល
6. នាយកដ្ឋានអធិការកិច្ចកិច្ចការនគរបាលរាជធានីភ្នំពេញ
7. នាយកដ្ឋានទទួលពាក្យបណ្ឹង និងអង្កេតស្រាវជ្រាវកិច្ចការនគរបាល

### Ranks — មន្រ្តីនគរបាល (12)
ឯកឧត្តម, ឧត្តមសេនីយ៍ឯក, ឧត្តមសេនីយ៍ទោ, ឧត្តមសេនីយ៍ត្រី,
វរសេនីយ៍ឯក, វរសេនីយ៍ទោ, វរសេនីយ៍ត្រី,
អនុសេនីយ៍ឯក, អនុសេនីយ៍ទោ, អនុសេនីយ៍ត្រី,
ព្រឹទ្ធបុរសឯក, ព្រឹទ្ធបុរសទោ

### Ranks — ស៊ីវិល (3)
លោក, លោកស្រី, ព្រឹទ្ធបុរស

### Education Levels (12)
អនុបណ្ឌិត, បរិញ្ញាបត្រ, បរិញ្ញាបត្ររង, បរិញ្ញាបត្រគ្រប់គ្រង,
ទុតិយភូមិ, មធ្យម.កំរិត២, ថ្នាក់ទី១២, ថ្នាក់ទី១២ងីម,
ថ្នាក់ទី១០ងីម, ថ្នាក់ទី៩, ថ្នាក់ទី៨ងីម, ថ្នាក់ទី៥

### Default Users (pre-seeded)
| Name | Email | Password | Role (UI) |
|---|---|---|---|
| System Admin | admin@hrsystem.gov.kh | admin123 | Admin |
| HR Officer | hr@hrsystem.gov.kh | hr123456 | Staff |

> Additional accounts can be created via **Settings → គ្រប់គ្រងគណនីអ្នកប្រើ** (Admin only).
> Roles: **Admin** = full access, **Staff** = create/edit employees (no delete), **Viewer** = read-only (no Settings).

---

## 11. How to Run Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # http://localhost:5173
```

### First-time setup
```bash
cd backend
npx prisma db push   # Create tables
node prisma/seed.js  # Insert initial data
```

---

## 12. Environment Variables

**backend/.env** (local development)
```
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="hrsystem_jwt_secret_key_2026"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

**frontend/.env** (local development)
```
VITE_API_URL=http://localhost:5000/api
```

**On Render (production)** — set via Render dashboard environment variables:
```
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
JWT_SECRET=<your-secret>
FRONTEND_URL=https://frontend-swart-chi-49.vercel.app
```

**On Vercel (production)** — set via Vercel dashboard or CLI:
```
VITE_API_URL=https://hrsystem-nkcm.onrender.com/api
```

> Note: Use the Supabase **session pooler** (port 5432 on the pooler hostname, NOT port 5432 on the direct `db.` hostname). Port 5432 direct is blocked. The transaction pooler (port 6543) is incompatible with Prisma's prepared statements.

See `.env.example` files in each folder for templates.

---

## 13. Production Deployment

### Live URLs
| | URL |
|---|---|
| Frontend | https://frontend-swart-chi-49.vercel.app |
| Backend | https://hrsystem-nkcm.onrender.com |
| Database | Supabase PostgreSQL — project ref `flwyhrxivbqobcyriyyf`, region ap-southeast-2 (Sydney) |

### Frontend — Vercel (free tier)
- Auto-deploys on push to `main`
- Build: Vite, output `dist/`
- Env var: `VITE_API_URL=https://hrsystem-nkcm.onrender.com/api`
- Manual deploy: `cd frontend && npx vercel deploy --prod`

### Backend — Render (free tier, native Node.js)
- Auto-deploys on push to `main`
- **Root Directory:** `backend` (set in Render service settings)
- **Build command:** `npm install && npx prisma generate && node prisma/seed.js`
- **Start command:** `node src/index.js`
- Env vars set on Render dashboard: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
- Free tier sleeps after 15 min inactivity — first wake takes ~30 sec

### Database — Supabase PostgreSQL (persistent)
- Data **survives all redeploys** — no more data loss
- Schema applied manually via Supabase SQL Editor (run `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` to generate SQL)
- `seed.js` runs on every Render start but skips immediately if data already exists (idempotent)
- For future schema changes: generate SQL diff with `prisma migrate diff` and run in Supabase SQL Editor

### Important
- **Do not use** the Supabase direct connection hostname (`db.PROJECT.supabase.co:5432`) — blocked by Render's network
- **Use** the session pooler: `aws-1-ap-southeast-2.pooler.supabase.com:5432` (no `pgbouncer=true` needed)
- The transaction pooler (port 6543) is **incompatible** with Prisma's prepared statements — use session pooler (port 5432)

---

## 14. Future Roadmap

| Feature | Status |
|---|---|
| Bulk import from PDF/Excel | ✅ Done — 419 employees |
| Activity log (who changed what) | ✅ Done |
| Export to PDF (monthly report) | Planned v2 |
| Export to Excel | Planned v2 |
| Payroll calculation | Planned v2 |
| Attendance tracking | Planned v2 |
| Leave / time-off requests | Planned v2 |
| User management UI | Planned v2 |
| PostgreSQL migration | ✅ Done — Supabase (June 2026) |

---

*Last updated: June 2026 — Claude Sonnet 4.6*
