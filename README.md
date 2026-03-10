# 🏥 MediCore — Hospital Management System

A full-stack web application built on top of your `HospitalDB` MySQL schema.

---

## Project Structure

```
dbms project final/
├── final_database.sql        # Complete database schema + seed data
├── insert_patients.js      # Script to insert additional patients
├── insert_records.js        # Script to generate appointments, treatments, bills
├── server.js                # Original server file (use hospital-backend instead)
├── hospital-backend/        # Node.js + Express REST API
│   ├── package.json
│   └── server.js
└── hospital-frontend/       # React SPA (Vite)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        └── App.jsx
```

---

## ⚙️ Setup Instructions

### 1. MySQL Database
Run your existing `final_database.sql` file to create the database:
```sql
mysql -u root -p < final_database.sql
```

---

### 2. Backend (Node.js + Express)

```bash
cd hospital-backend
npm install
npm start
```
API runs at: **http://localhost:5000**

---

### 3. Frontend (React)

```bash
cd hospital-frontend
npm install
npm run dev
```
App runs at: **http://localhost:5173**

---

## 📡 API Endpoints

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | /api/stats                | Dashboard summary stats              |
| GET    | /api/departments          | List all departments                 |
| POST   | /api/departments          | Add department                       |
| DELETE | /api/departments/:id      | Delete department                    |
| GET    | /api/doctors              | List all doctors (with dept name)    |
| POST   | /api/doctors              | Add doctor                           |
| PUT    | /api/doctors/:id          | Update doctor                        |
| DELETE | /api/doctors/:id          | Delete doctor                        |
| GET    | /api/patients             | List all patients                    |
| POST   | /api/patients             | Add patient                          |
| PUT    | /api/patients/:id         | Update patient                       |
| DELETE | /api/patients/:id         | Delete patient                       |
| GET    | /api/appointments         | List appointments (with names)       |
| POST   | /api/appointments         | Book appointment                     |
| PUT    | /api/appointments/:id     | Update appointment status            |
| DELETE | /api/appointments/:id     | Delete appointment                   |
| GET    | /api/treatments           | List treatments                      |
| POST   | /api/treatments           | Add treatment (triggers bill)          |
| GET    | /api/bills                | List all bills                       |
| PUT    | /api/bills/:id            | Update payment status                |

---

## ✨ Features

- **Dashboard** — Live stats: patients, doctors, appointments, revenue, pending bills
- **Patients** — Full CRUD (add, edit, delete)
- **Doctors** — Full CRUD with department linking
- **Appointments** — Book appointments, update status inline
- **Treatments** — Add treatments (DB trigger auto-creates bill)
- **Billing** — Mark bills as paid/unpaid, revenue summary
- **Departments** — Manage hospital departments

---

## 🗄️ Key DB Features Used

| Feature   | Where Used                                                    |
|-----------|---------------------------------------------------------------|
| Trigger   | `generate_bill` fires on `Treatment INSERT` → auto bill       |
| Procedure | `AddPatient` (can be called via `/api/patients` POST route)   |
| View      | `DoctorSchedule` (can be queried separately if needed)        |
| Joins     | All list endpoints join across tables for human-readable data |

---

## 🔧 Database Credentials

- **Host**: localhost
- **User**: root
- **Password**: Sonu@8205
- **Database**: HospitalDB

---

## 📝 Note

The project is now ready to run! Just:
1. Import the SQL file
2. Start the backend
3. Start the frontend

