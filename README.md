# HR System - អគ្គាធិការដ្ឋាន

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express + Prisma
- Database: SQLite (dev) — switch DATABASE_URL to PostgreSQL for production

## Setup

### 1. Backend
```bash
cd backend
npm install
npm run db:push      # Create tables (SQLite file: backend/prisma/dev.db)
npm run db:seed      # Seed initial data (users, ranks, departments)
npm run db:import    # Optional: import backend/prisma/employees.json
npm run dev          # Start on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm run dev          # Start on http://localhost:5173
```

## Default Login Accounts
| Role  | Email                      | Password  |
|-------|---------------------------|-----------|
| Admin | admin@hrsystem.gov.kh      | admin123  |
| HR    | hr@hrsystem.gov.kh        | hr123456  |

## Features
- Employee CRUD (Add/Edit/View/Delete)
- Department & Office management
- Rank & Education Level management
- Search & filter employees
- Role-based access (Admin / HR / Viewer)
- Dashboard with statistics
- Full Khmer language support
