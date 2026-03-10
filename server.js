const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool for better performance
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Sonu@8205",
  database: "HospitalDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to MySQL database");
    connection.release();
  }
});

// ==================== MIDDLEWARE FUNCTIONS ====================

// Input validation middleware
const validateInput = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    next();
  };
};

// Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== UTILITY FUNCTIONS ====================

// Pagination helper
const getPagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const startIndex = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, startIndex };
};

// Response formatter
const successResponse = (data, message = "Success", pagination = null) => {
  const response = { success: true, message, data };
  if (pagination) {
    response.pagination = pagination;
  }
  return response;
};

// ==================== DEPARTMENTS API ====================

// Get all departments with pagination and search
app.get("/api/departments", asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const { pageNum, limitNum, startIndex } = getPagination(page, limit);
  
  let sql = "SELECT * FROM Department";
  let countSql = "SELECT COUNT(*) as total FROM Department";
  let params = [];
  
  if (search) {
    sql += " WHERE department_name LIKE ?";
    countSql += " WHERE department_name LIKE ?";
    params.push(`%${search}%`);
  }
  
  sql += " ORDER BY department_id DESC LIMIT ? OFFSET ?";
  
  const [countResult] = await db.promise().query(countSql, search ? [`%${search}%`] : []);
  const [departments] = await db.promise().query(sql, [...params, limitNum, startIndex]);
  
  res.json(successResponse(departments, "Departments fetched successfully", {
    total: countResult[0].total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(countResult[0].total / limitNum)
  }));
}));

// Get single department
app.get("/api/departments/:id", asyncHandler(async (req, res) => {
  const [departments] = await db.promise().query(
    "SELECT * FROM Department WHERE department_id = ?",
    [req.params.id]
  );
  
  if (departments.length === 0) {
    return res.status(404).json({ error: "Department not found" });
  }
  
  res.json(successResponse(departments[0]));
}));

// Add department
app.post("/api/departments", 
  validateInput(['department_name']),
  asyncHandler(async (req, res) => {
    const { department_name } = req.body;
    
    const [result] = await db.promise().query(
      "INSERT INTO Department (department_name) VALUES (?)",
      [department_name]
    );
    
    res.status(201).json(successResponse({ 
      department_id: result.insertId, 
      department_name 
    }, "Department created successfully"));
}));

// Update department
app.put("/api/departments/:id", asyncHandler(async (req, res) => {
  const { department_name } = req.body;
  
  const [result] = await db.promise().query(
    "UPDATE Department SET department_name = ? WHERE department_id = ?",
    [department_name, req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Department not found" });
  }
  
  res.json(successResponse({ department_id: req.params.id, department_name }, "Department updated successfully"));
}));

// Delete department
app.delete("/api/departments/:id", asyncHandler(async (req, res) => {
  const [result] = await db.promise().query(
    "DELETE FROM Department WHERE department_id = ?",
    [req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Department not found" });
  }
  
  res.json(successResponse(null, "Department deleted successfully"));
}));

// ==================== DOCTORS API ====================

// Get all doctors with pagination, search, and filter
app.get("/api/doctors", asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', department_id = '' } = req.query;
  const { pageNum, limitNum, startIndex } = getPagination(page, limit);
  
  let sql = `
    SELECT d.*, dep.department_name 
    FROM Doctor d 
    LEFT JOIN Department dep ON d.department_id = dep.department_id
    WHERE 1=1
  `;
  let countSql = "SELECT COUNT(*) as total FROM Doctor d WHERE 1=1";
  let params = [];
  let countParams = [];
  
  if (search) {
    sql += " AND (d.name LIKE ? OR d.specialization LIKE ?)";
    countSql += " AND (d.name LIKE ? OR d.specialization LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }
  
  if (department_id) {
    sql += " AND d.department_id = ?";
    countSql += " AND d.department_id = ?";
    params.push(department_id);
    countParams.push(department_id);
  }
  
  sql += " ORDER BY d.doctor_id DESC LIMIT ? OFFSET ?";
  
  const [countResult] = await db.promise().query(countSql, countParams.length ? countParams : []);
  const [doctors] = await db.promise().query(sql, [...params, limitNum, startIndex]);
  
  res.json(successResponse(doctors, "Doctors fetched successfully", {
    total: countResult[0].total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(countResult[0].total / limitNum)
  }));
}));

// Get single doctor
app.get("/api/doctors/:id", asyncHandler(async (req, res) => {
  const [doctors] = await db.promise().query(
    `SELECT d.*, dep.department_name 
     FROM Doctor d 
     LEFT JOIN Department dep ON d.department_id = dep.department_id
     WHERE d.doctor_id = ?`,
    [req.params.id]
  );
  
  if (doctors.length === 0) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  
  res.json(successResponse(doctors[0]));
}));

// Add doctor
app.post("/api/doctors",
  validateInput(['name', 'specialization', 'phone', 'department_id']),
  asyncHandler(async (req, res) => {
    const { name, specialization, phone, department_id } = req.body;
    
    const [result] = await db.promise().query(
      "INSERT INTO Doctor (name, specialization, phone, department_id) VALUES (?, ?, ?, ?)",
      [name, specialization, phone, department_id]
    );
    
    res.status(201).json(successResponse({ 
      doctor_id: result.insertId, 
      name, 
      specialization, 
      phone, 
      department_id 
    }, "Doctor created successfully"));
}));

// Update doctor
app.put("/api/doctors/:id", asyncHandler(async (req, res) => {
  const { name, specialization, phone, department_id } = req.body;
  
  const [result] = await db.promise().query(
    "UPDATE Doctor SET name = ?, specialization = ?, phone = ?, department_id = ? WHERE doctor_id = ?",
    [name, specialization, phone, department_id, req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  
  res.json(successResponse({ doctor_id: req.params.id, name, specialization, phone, department_id }, "Doctor updated successfully"));
}));

// Delete doctor
app.delete("/api/doctors/:id", asyncHandler(async (req, res) => {
  const [result] = await db.promise().query(
    "DELETE FROM Doctor WHERE doctor_id = ?",
    [req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  
  res.json(successResponse(null, "Doctor deleted successfully"));
}));

// Get doctors by department
app.get("/api/doctors/department/:deptId", asyncHandler(async (req, res) => {
  const [doctors] = await db.promise().query(
    "SELECT doctor_id, name, specialization, phone FROM Doctor WHERE department_id = ?",
    [req.params.deptId]
  );
  
  res.json(successResponse(doctors));
}));

// ==================== PATIENTS API ====================

// Get all patients with pagination and search
app.get("/api/patients", asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const { pageNum, limitNum, startIndex } = getPagination(page, limit);
  
  let sql = "SELECT * FROM Patient";
  let countSql = "SELECT COUNT(*) as total FROM Patient";
  let params = [];
  
  if (search) {
    sql += " WHERE (name LIKE ? OR phone LIKE ? OR address LIKE ?)";
    countSql += " WHERE (name LIKE ? OR phone LIKE ? OR address LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  sql += " ORDER BY patient_id DESC LIMIT ? OFFSET ?";
  
  const [countResult] = await db.promise().query(countSql, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []);
  const [patients] = await db.promise().query(sql, [...params, limitNum, startIndex]);
  
  res.json(successResponse(patients, "Patients fetched successfully", {
    total: countResult[0].total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(countResult[0].total / limitNum)
  }));
}));

// Get single patient
app.get("/api/patients/:id", asyncHandler(async (req, res) => {
  const [patients] = await db.promise().query(
    "SELECT * FROM Patient WHERE patient_id = ?",
    [req.params.id]
  );
  
  if (patients.length === 0) {
    return res.status(404).json({ error: "Patient not found" });
  }
  
  res.json(successResponse(patients[0]));
}));

// Get patient history (appointments, treatments, bills)
app.get("/api/patients/:id/history", asyncHandler(async (req, res) => {
  const patientId = req.params.id;
  
  const [appointments] = await db.promise().query(
    `SELECT a.*, d.name as doctor_name, dep.department_name
     FROM Appointment a
     JOIN Doctor d ON a.doctor_id = d.doctor_id
     JOIN Department dep ON d.department_id = dep.department_id
     WHERE a.patient_id = ?
     ORDER BY a.appointment_date DESC`,
    [patientId]
  );
  
  const [treatments] = await db.promise().query(
    `SELECT t.*, a.appointment_date, d.name as doctor_name
     FROM Treatment t
     JOIN Appointment a ON t.appointment_id = a.appointment_id
     JOIN Doctor d ON a.doctor_id = d.doctor_id
     WHERE a.patient_id = ?
     ORDER BY a.appointment_date DESC`,
    [patientId]
  );
  
  const [bills] = await db.promise().query(
    `SELECT b.*, t.diagnosis, t.treatment_details
     FROM Bill b
     JOIN Treatment t ON b.treatment_id = t.treatment_id
     JOIN Appointment a ON t.appointment_id = a.appointment_id
     WHERE a.patient_id = ?
     ORDER BY b.bill_date DESC`,
    [patientId]
  );
  
  res.json(successResponse({ appointments, treatments, bills }));
}));

// Add patient
app.post("/api/patients",
  validateInput(['name', 'age', 'gender', 'phone']),
  asyncHandler(async (req, res) => {
    const { name, age, gender, phone, address } = req.body;
    
    const [result] = await db.promise().query(
      "INSERT INTO Patient (name, age, gender, phone, address) VALUES (?, ?, ?, ?, ?)",
      [name, age, gender, phone, address || '']
    );
    
    res.status(201).json(successResponse({ 
      patient_id: result.insertId, 
      name, 
      age, 
      gender, 
      phone, 
      address 
    }, "Patient created successfully"));
}));

// Update patient
app.put("/api/patients/:id", asyncHandler(async (req, res) => {
  const { name, age, gender, phone, address } = req.body;
  
  const [result] = await db.promise().query(
    "UPDATE Patient SET name = ?, age = ?, gender = ?, phone = ?, address = ? WHERE patient_id = ?",
    [name, age, gender, phone, address, req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Patient not found" });
  }
  
  res.json(successResponse({ patient_id: req.params.id, name, age, gender, phone, address }, "Patient updated successfully"));
}));

// Delete patient
app.delete("/api/patients/:id", asyncHandler(async (req, res) => {
  const [result] = await db.promise().query(
    "DELETE FROM Patient WHERE patient_id = ?",
    [req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Patient not found" });
  }
  
  res.json(successResponse(null, "Patient deleted successfully"));
}));

// ==================== APPOINTMENTS API ====================

// Get all appointments with pagination and filters
app.get("/api/appointments", asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', status = '', doctor_id = '', patient_id = '' } = req.query;
  const { pageNum, limitNum, startIndex } = getPagination(page, limit);
  
  let sql = `
    SELECT a.*, p.name as patient_name, p.phone as patient_phone, d.name as doctor_name, dep.department_name
    FROM Appointment a
    JOIN Patient p ON a.patient_id = p.patient_id
    JOIN Doctor d ON a.doctor_id = d.doctor_id
    JOIN Department dep ON d.department_id = dep.department_id
    WHERE 1=1
  `;
  let countSql = "SELECT COUNT(*) as total FROM Appointment a WHERE 1=1";
  let params = [];
  let countParams = [];
  
  if (search) {
    sql += " AND (p.name LIKE ? OR d.name LIKE ?)";
    countSql += " AND (p.name LIKE ? OR d.name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }
  
  if (status) {
    sql += " AND a.status = ?";
    countSql += " AND a.status = ?";
    params.push(status);
    countParams.push(status);
  }
  
  if (doctor_id) {
    sql += " AND a.doctor_id = ?";
    countSql += " AND a.doctor_id = ?";
    params.push(doctor_id);
    countParams.push(doctor_id);
  }
  
  if (patient_id) {
    sql += " AND a.patient_id = ?";
    countSql += " AND a.patient_id = ?";
    params.push(patient_id);
    countParams.push(patient_id);
  }
  
  sql += " ORDER BY a.appointment_date DESC, a.appointment_id DESC LIMIT ? OFFSET ?";
  
  const [countResult] = await db.promise().query(countSql, countParams.length ? countParams : []);
  const [appointments] = await db.promise().query(sql, [...params, limitNum, startIndex]);
  
  res.json(successResponse(appointments, "Appointments fetched successfully", {
    total: countResult[0].total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(countResult[0].total / limitNum)
  }));
}));

// Get today's appointments
app.get("/api/appointments/today", asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [appointments] = await db.promise().query(
    `SELECT a.*, p.name as patient_name, p.phone as patient_phone, d.name as doctor_name
     FROM Appointment a
     JOIN Patient p ON a.patient_id = p.patient_id
     JOIN Doctor d ON a.doctor_id = d.doctor_id
     WHERE a.appointment_date = ?
     ORDER BY a.appointment_id`,
    [today]
  );
  
  res.json(successResponse(appointments, "Today's appointments"));
}));

// Get single appointment
app.get("/api/appointments/:id", asyncHandler(async (req, res) => {
  const [appointments] = await db.promise().query(
    `SELECT a.*, p.name as patient_name, p.phone as patient_phone, d.name as doctor_name
     FROM Appointment a
     JOIN Patient p ON a.patient_id = p.patient_id
     JOIN Doctor d ON a.doctor_id = d.doctor_id
     WHERE a.appointment_id = ?`,
    [req.params.id]
  );
  
  if (appointments.length === 0) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  
  res.json(successResponse(appointments[0]));
}));

// Add appointment
app.post("/api/appointments",
  validateInput(['patient_id', 'doctor_id', 'appointment_date']),
  asyncHandler(async (req, res) => {
    const { patient_id, doctor_id, appointment_date, status = 'Pending' } = req.body;
    
    // Check if doctor is available at that time
    const [existing] = await db.promise().query(
      "SELECT * FROM Appointment WHERE doctor_id = ? AND appointment_date = ? AND status != 'Cancelled'",
      [doctor_id, appointment_date]
    );
    
    const [result] = await db.promise().query(
      "INSERT INTO Appointment (patient_id, doctor_id, appointment_date, status) VALUES (?, ?, ?, ?)",
      [patient_id, doctor_id, appointment_date, status]
    );
    
    res.status(201).json(successResponse({ 
      appointment_id: result.insertId, 
      patient_id, 
      doctor_id, 
      appointment_date, 
      status 
    }, "Appointment created successfully"));
}));

// Update appointment
app.put("/api/appointments/:id", asyncHandler(async (req, res) => {
  const { patient_id, doctor_id, appointment_date, status } = req.body;
  
  const [result] = await db.promise().query(
    "UPDATE Appointment SET patient_id = ?, doctor_id = ?, appointment_date = ?, status = ? WHERE appointment_id = ?",
    [patient_id, doctor_id, appointment_date, status, req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  
  res.json(successResponse({ appointment_id: req.params.id }, "Appointment updated successfully"));
}));

// Update appointment status only
app.patch("/api/appointments/:id/status", asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const [result] = await db.promise().query(
    "UPDATE Appointment SET status = ? WHERE appointment_id = ?",
    [status, req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  
  res.json(successResponse({ appointment_id: req.params.id, status }, "Appointment status updated"));
}));

// Delete appointment
app.delete("/api/appointments/:id", asyncHandler(async (req, res) => {
  const [result] = await db.promise().query(
    "DELETE FROM Appointment WHERE appointment_id = ?",
    [req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  
  res.json(successResponse(null, "Appointment deleted successfully"));
}));

// ==================== TREATMENTS API ====================

// Get all treatments with pagination
app.get("/api/treatments", asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const { pageNum, limitNum, startIndex } = getPagination(page, limit);
  
  let sql = `
    SELECT t.*, a.appointment_date, p.name as patient_name, d.name as doctor_name
    FROM Treatment t
    JOIN Appointment a ON t.appointment_id = a.appointment_id
    JOIN Patient p ON a.patient_id = p.patient_id
    JOIN Doctor d ON a.doctor_id = d.doctor_id
  `;
  let countSql = "SELECT COUNT(*) as total FROM Treatment t WHERE 1=1";
  let params = [];
  let countParams = [];
  
  if (search) {
    sql += " WHERE (t.diagnosis LIKE ? OR p.name LIKE ?)";
    countSql += " AND (t.diagnosis LIKE ? OR p.name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }
  
  sql += " ORDER BY t.treatment_id DESC LIMIT ? OFFSET ?";
  
  const [countResult] = await db.promise().query(countSql, countParams.length ? countParams : []);
  const [treatments] = await db.promise().query(sql, [...params, limitNum, startIndex]);
  
  res.json(successResponse(treatments, "Treatments fetched successfully", {
    total: countResult[0].total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(countResult[0].total / limitNum)
  }));
}));

// Get single treatment
app.get("/api/treatments/:id", asyncHandler(async (req, res) => {
  const [treatments] = await db.promise().query(
    `SELECT t.*, a.appointment_date, p.name as patient_name, d.name as doctor_name
     FROM Treatment t
     JOIN Appointment a ON t.appointment_id = a.appointment_id
     JOIN Patient p ON a.patient_id = p.patient_id
     JOIN Doctor d ON a.doctor_id = d.doctor_id
     WHERE t.treatment_id = ?`,
    [req.params.id]
  );
  
  if (treatments.length === 0) {
    return res.status(404).json({ error: "Treatment not found" });
  }
  
  res.json(successResponse(treatments[0]));
}));

// Add treatment
app.post("/api/treatments",
  validateInput(['appointment_id', 'diagnosis', 'treatment_details', 'cost']),
  asyncHandler(async (req, res) => {
    const { appointment_id, diagnosis, treatment_details, cost } = req.body;
    
    const [result] = await db.promise().query(
      "INSERT INTO Treatment (appointment_id, diagnosis, treatment_details, cost) VALUES (?, ?, ?, ?)",
      [appointment_id, diagnosis, treatment_details, cost]
    );
    
    // Auto-create bill for treatment
    const billDate = new Date().toISOString().split('T')[0];
    await db.promise().query(
      "INSERT INTO Bill (treatment_id, total_amount, bill_date, payment_status) VALUES (?, ?, ?, ?)",
      [result.insertId, cost, billDate, 'Pending']
    );
    
    res.status(201).json(successResponse({ 
      treatment_id: result.insertId, 
      appointment_id, 
      diagnosis, 
      treatment_details, 
      cost,
      bill_created: true
    }, "Treatment added. Bill auto-generated."));
}));

// ==================== BILLS API ====================

// Get all bills with pagination and filters
app.get("/api/bills", asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', payment_status = '' } = req.query;
  const { pageNum, limitNum, startIndex } = getPagination(page, limit);
  
  let sql = `
    SELECT b.*, t.diagnosis, t.treatment_details, t.cost as treatment_cost,
           p.name as patient_name, p.phone as patient_phone,
           a.appointment_date
    FROM Bill b
    JOIN Treatment t ON b.treatment_id = t.treatment_id
    JOIN Appointment a ON t.appointment_id = a.appointment_id
    JOIN Patient p ON a.patient_id = p.patient_id
    WHERE 1=1
  `;
  let countSql = "SELECT COUNT(*) as total FROM Bill b WHERE 1=1";
  let params = [];
  let countParams = [];
  
  if (search) {
    sql += " AND p.name LIKE ?";
    countSql += " AND p.name LIKE ?";
    params.push(`%${search}%`);
    countParams.push(`%${search}%`);
  }
  
  if (payment_status) {
    sql += " AND b.payment_status = ?";
    countSql += " AND b.payment_status = ?";
    params.push(payment_status);
    countParams.push(payment_status);
  }
  
  sql += " ORDER BY b.bill_date DESC LIMIT ? OFFSET ?";
  
  const [countResult] = await db.promise().query(countSql, countParams.length ? countParams : []);
  const [bills] = await db.promise().query(sql, [...params, limitNum, startIndex]);
  
  res.json(successResponse(bills, "Bills fetched successfully", {
    total: countResult[0].total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(countResult[0].total / limitNum)
  }));
}));

// Get single bill
app.get("/api/bills/:id", asyncHandler(async (req, res) => {
  const [bills] = await db.promise().query(
    `SELECT b.*, t.diagnosis, t.treatment_details, t.cost as treatment_cost,
            p.name as patient_name, p.phone as patient_phone, p.address as patient_address,
            a.appointment_date, doc.name as doctor_name
     FROM Bill b
     JOIN Treatment t ON b.treatment_id = t.treatment_id
     JOIN Appointment a ON t.appointment_id = a.appointment_id
     JOIN Patient p ON a.patient_id = p.patient_id
     JOIN Doctor doc ON a.doctor_id = doc.doctor_id
     WHERE b.bill_id = ?`,
    [req.params.id]
  );
  
  if (bills.length === 0) {
    return res.status(404).json({ error: "Bill not found" });
  }
  
  res.json(successResponse(bills[0]));
}));

// Update bill payment status
app.patch("/api/bills/:id/status", asyncHandler(async (req, res) => {
  const { payment_status } = req.body;
  
  const [result] = await db.promise().query(
    "UPDATE Bill SET payment_status = ? WHERE bill_id = ?",
    [payment_status, req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Bill not found" });
  }
  
  res.json(successResponse({ bill_id: req.params.id, payment_status }, "Bill payment status updated"));
}));

// Pay bill (mark as paid)
app.post("/api/bills/:id/pay", asyncHandler(async (req, res) => {
  const [result] = await db.promise().query(
    "UPDATE Bill SET payment_status = 'Paid' WHERE bill_id = ?",
    [req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Bill not found" });
  }
  
  res.json(successResponse({ bill_id: req.params.id, payment_status: 'Paid' }, "Bill paid successfully"));
}));

// ==================== DASHBOARD STATS API ====================

// Get comprehensive dashboard statistics
app.get("/api/stats", asyncHandler(async (req, res) => {
  // Get total patients
  const [patientsResult] = await db.promise().query("SELECT COUNT(*) as total FROM Patient");
  
  // Get total doctors
  const [doctorsResult] = await db.promise().query("SELECT COUNT(*) as total FROM Doctor");
  
  // Get total departments
  const [departmentsResult] = await db.promise().query("SELECT COUNT(*) as total FROM Department");
  
  // Get total appointments
  const [appointmentsResult] = await db.promise().query("SELECT COUNT(*) as total FROM Appointment");
  
  // Get today's appointments
  const today = new Date().toISOString().split('T')[0];
  const [todayAppointmentsResult] = await db.promise().query(
    "SELECT COUNT(*) as total FROM Appointment WHERE appointment_date = ?",
    [today]
  );
  
  // Get pending appointments
  const [pendingAppointmentsResult] = await db.promise().query(
    "SELECT COUNT(*) as total FROM Appointment WHERE status = 'Pending'"
  );
  
  // Get total treatments
  const [treatmentsResult] = await db.promise().query("SELECT COUNT(*) as total FROM Treatment");
  
  // Get total bills
  const [billsResult] = await db.promise().query("SELECT COUNT(*) as total FROM Bill");
  
  // Get paid bills
  const [paidBillsResult] = await db.promise().query(
    "SELECT COUNT(*) as total, COALESCE(SUM(total_amount), 0) as amount FROM Bill WHERE payment_status = 'Paid'"
  );
  
  // Get pending bills
  const [pendingBillsResult] = await db.promise().query(
    "SELECT COUNT(*) as total, COALESCE(SUM(total_amount), 0) as amount FROM Bill WHERE payment_status = 'Pending'"
  );
  
  // Get revenue by department
  const [revenueByDept] = await db.promise().query(`
    SELECT dep.department_name, COUNT(t.treatment_id) as treatment_count, 
           COALESCE(SUM(b.total_amount), 0) as revenue
    FROM Department dep
    LEFT JOIN Doctor doc ON dep.department_id = doc.department_id
    LEFT JOIN Appointment a ON doc.doctor_id = a.doctor_id
    LEFT JOIN Treatment t ON a.appointment_id = t.appointment_id
    LEFT JOIN Bill b ON t.treatment_id = b.treatment_id AND b.payment_status = 'Paid'
    GROUP BY dep.department_id
    ORDER BY revenue DESC
  `);
  
  // Get recent appointments
  const [recentAppointments] = await db.promise().query(`
    SELECT a.*, p.name as patient_name, d.name as doctor_name
    FROM Appointment a
    JOIN Patient p ON a.patient_id = p.patient_id
    JOIN Doctor d ON a.doctor_id = d.doctor_id
    ORDER BY a.appointment_date DESC, a.appointment_id DESC
    LIMIT 5
  `);
  
  res.json(successResponse({
    overview: {
      total_patients: patientsResult[0].total,
      total_doctors: doctorsResult[0].total,
      total_departments: departmentsResult[0].total,
      total_appointments: appointmentsResult[0].total,
      total_treatments: treatmentsResult[0].total,
      total_bills: billsResult[0].total
    },
    appointments: {
      today: todayAppointmentsResult[0].total,
      pending: pendingAppointmentsResult[0].total
    },
    billing: {
      paid: {
        count: paidBillsResult[0].total,
        amount: paidBillsResult[0].amount
      },
      pending: {
        count: pendingBillsResult[0].total,
        amount: pendingBillsResult[0].amount
      },
      total_revenue: paidBillsResult[0].amount
    },
    revenue_by_department: revenueByDept,
    recent_appointments: recentAppointments
  }));
}));

// Get revenue statistics
app.get("/api/stats/revenue", asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  let dateCondition;
  
  switch(period) {
    case 'week':
      dateCondition = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
      break;
    case 'month':
      dateCondition = 'DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      break;
    case 'year':
      dateCondition = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
      break;
    default:
      dateCondition = 'DATE_SUB(NOW(), INTERVAL 1 MONTH)';
  }
  
  const [result] = await db.promise().query(`
    SELECT COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as bill_count
    FROM Bill 
    WHERE payment_status = 'Paid' AND bill_date >= ${dateCondition}
  `);
  
  res.json(successResponse(result[0]));
}));

// ==================== REPORTS API ====================

// Get department-wise report
app.get("/api/reports/departments", asyncHandler(async (req, res) => {
  const [report] = await db.promise().query(`
    SELECT 
      d.department_id,
      d.department_name,
      COUNT(DISTINCT doc.doctor_id) as doctor_count,
      COUNT(DISTINCT a.appointment_id) as appointment_count,
      COUNT(DISTINCT t.treatment_id) as treatment_count,
      COALESCE(SUM(b.total_amount), 0) as revenue
    FROM Department d
    LEFT JOIN Doctor doc ON d.department_id = doc.department_id
    LEFT JOIN Appointment a ON doc.doctor_id = a.doctor_id
    LEFT JOIN Treatment t ON a.appointment_id = t.appointment_id
    LEFT JOIN Bill b ON t.treatment_id = b.treatment_id AND b.payment_status = 'Paid'
    GROUP BY d.department_id
    ORDER BY revenue DESC
  `);
  
  res.json(successResponse(report));
}));

// Get doctor-wise report
app.get("/api/reports/doctors", asyncHandler(async (req, res) => {
  const { department_id = '' } = req.query;
  
  let sql = `
    SELECT 
      doc.doctor_id,
      doc.name,
      doc.specialization,
      dep.department_name,
      COUNT(a.appointment_id) as appointment_count,
      COUNT(t.treatment_id) as treatment_count,
      COALESCE(SUM(b.total_amount), 0) as revenue
    FROM Doctor doc
    JOIN Department dep ON doc.department_id = dep.department_id
    LEFT JOIN Appointment a ON doc.doctor_id = a.doctor_id
    LEFT JOIN Treatment t ON a.appointment_id = t.appointment_id
    LEFT JOIN Bill b ON t.treatment_id = b.treatment_id AND b.payment_status = 'Paid'
  `;
  
  if (department_id) {
    sql += " WHERE doc.department_id = ?";
    sql += " GROUP BY doc.doctor_id ORDER BY revenue DESC";
    var [report] = await db.promise().query(sql, [department_id]);
  } else {
    sql += " GROUP BY doc.doctor_id ORDER BY revenue DESC";
    var [report] = await db.promise().query(sql);
  }
  
  res.json(successResponse(report));
}));

// ==================== GLOBAL ERROR HANDLER ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
