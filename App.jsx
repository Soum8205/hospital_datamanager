import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

const get = (path) => fetch(API + path).then((r) => r.json());
const post = (path, data) =>
  fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
const put = (path, data) =>
  fetch(API + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
const del = (path) =>
  fetch(API + path, { method: "DELETE" }).then((r) => r.json());

const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  header: { background: "#2c3e50", color: "white", padding: "20px", marginBottom: "20px" },
  nav: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  navBtn: { padding: "10px 20px", cursor: "pointer", border: "none", borderRadius: "5px", background: "#ecf0f1" },
  navBtnActive: { background: "#3498db", color: "white" },
  card: { background: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { borderBottom: "2px solid #ddd", padding: "10px", textAlign: "left", background: "#f8f9fa" },
  td: { borderBottom: "1px solid #ddd", padding: "10px" },
  btn: { padding: "8px 16px", margin: "2px", cursor: "pointer", border: "none", borderRadius: "4px" },
  btnPrimary: { background: "#27ae60", color: "white" },
  btnDanger: { background: "#e74c3c", color: "white" },
  btnSecondary: { background: "#95a5a6", color: "white" },
  input: { padding: "8px", margin: "5px", border: "1px solid #ddd", borderRadius: "4px", width: "200px" },
  label: { display: "block", marginTop: "10px", fontWeight: "bold" },
  formGroup: { marginBottom: "15px" },
  statBox: { display: "inline-block", background: "#3498db", color: "white", padding: "20px", borderRadius: "8px", margin: "5px", minWidth: "150px" },
  statNumber: { fontSize: "32px", fontWeight: "bold" },
  badge: { padding: "4px 8px", borderRadius: "12px", fontSize: "12px" },
  badgeGreen: { background: "#d5f4e6", color: "#27ae60" },
  badgeYellow: { background: "#fef9e7", color: "#f39c12" },
  badgeRed: { background: "#fadbd8", color: "#e74c3c" },
};

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    get("/stats").then(setStats);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <div style={styles.statBox}>
          <div style={styles.statNumber}>{stats.total_patients}</div>
          <div>Total Patients</div>
        </div>
        <div style={{ ...styles.statBox, background: "#27ae60" }}>
          <div style={styles.statNumber}>{stats.total_doctors}</div>
          <div>Doctors</div>
        </div>
        <div style={{ ...styles.statBox, background: "#e67e22" }}>
          <div style={styles.statNumber}>{stats.total_appointments}</div>
          <div>Appointments</div>
        </div>
        <div style={{ ...styles.statBox, background: "#9b59b6" }}>
          <div style={styles.statNumber}>₹{stats.total_revenue}</div>
          <div>Revenue</div>
        </div>
      </div>
    </div>
  );
}

function Patients() {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", age: "", gender: "Male", phone: "", address: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    get("/patients").then(setPatients);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await put(`/patients/${editingId}`, formData);
    } else {
      await post("/patients", formData);
    }
    setShowForm(false);
    setFormData({ name: "", age: "", gender: "Male", phone: "", address: "" });
    setEditingId(null);
    loadPatients();
  };

  const handleEdit = (patient) => {
    setFormData(patient);
    setEditingId(patient.patient_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this patient?")) {
      await del(`/patients/${id}`);
      loadPatients();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Patients</h2>
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", age: "", gender: "Male", phone: "", address: "" }); }}>
          + Add Patient
        </button>
      </div>

      {showForm && (
        <div style={styles.card}>
          <h3>{editingId ? "Edit Patient" : "Add New Patient"}</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name:</label>
            <input style={styles.input} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Age:</label>
            <input style={styles.input} type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Gender:</label>
            <select style={styles.input} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone:</label>
            <input style={styles.input} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Address:</label>
            <input style={styles.input} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSubmit}>Save</button>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Age</th>
              <th style={styles.th}>Gender</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Address</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.patient_id}>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.age}</td>
                <td style={styles.td}>{p.gender}</td>
                <td style={styles.td}>{p.phone}</td>
                <td style={styles.td}>{p.address}</td>
                <td style={styles.td}>
                  <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => handleEdit(p)}>Edit</button>
                  <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => handleDelete(p.patient_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", specialization: "", phone: "", department_id: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [d, dep] = await Promise.all([get("/doctors"), get("/departments")]);
    setDoctors(d);
    setDepartments(dep);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await put(`/doctors/${editingId}`, formData);
    } else {
      await post("/doctors", formData);
    }
    setShowForm(false);
    setFormData({ name: "", specialization: "", phone: "", department_id: "" });
    setEditingId(null);
    loadData();
  };

  const handleEdit = (doctor) => {
    setFormData(doctor);
    setEditingId(doctor.doctor_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this doctor?")) {
      await del(`/doctors/${id}`);
      loadData();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Doctors</h2>
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", specialization: "", phone: "", department_id: departments[0]?.department_id || "" }); }}>
          + Add Doctor
        </button>
      </div>

      {showForm && (
        <div style={styles.card}>
          <h3>{editingId ? "Edit Doctor" : "Add New Doctor"}</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name:</label>
            <input style={styles.input} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Specialization:</label>
            <input style={styles.input} value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone:</label>
            <input style={styles.input} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Department:</label>
            <select style={styles.input} value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
              ))}
            </select>
          </div>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSubmit}>Save</button>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Specialization</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.doctor_id}>
                <td style={styles.td}>{d.name}</td>
                <td style={styles.td}>{d.specialization}</td>
                <td style={styles.td}>{d.department_name}</td>
                <td style={styles.td}>{d.phone}</td>
                <td style={styles.td}>
                  <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => handleEdit(d)}>Edit</button>
                  <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => handleDelete(d.doctor_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ patient_id: "", doctor_id: "", appointment_date: "", status: "Pending" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [a, p, d] = await Promise.all([get("/appointments"), get("/patients"), get("/doctors")]);
    setAppointments(a);
    setPatients(p);
    setDoctors(d);
  };

  const handleSubmit = async () => {
    await post("/appointments", formData);
    setShowForm(false);
    setFormData({ patient_id: "", doctor_id: "", appointment_date: "", status: "Pending" });
    loadData();
  };

  const handleStatusChange = async (id, status) => {
    await put(`/appointments/${id}`, { status });
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this appointment?")) {
      await del(`/appointments/${id}`);
      loadData();
    }
  };

  const getBadgeStyle = (status) => {
    if (status === "Completed") return { ...styles.badge, ...styles.badgeGreen };
    if (status === "Pending") return { ...styles.badge, ...styles.badgeYellow };
    return { ...styles.badge, ...styles.badgeRed };
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Appointments</h2>
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => setShowForm(true)}>
          + Book Appointment
        </button>
      </div>

      {showForm && (
        <div style={styles.card}>
          <h3>Book Appointment</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Patient:</label>
            <select style={styles.input} value={formData.patient_id} onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}>
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Doctor:</label>
            <select style={styles.input} value={formData.doctor_id} onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}>
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date:</label>
            <input style={styles.input} type="date" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} />
          </div>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSubmit}>Book</button>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Patient</th>
              <th style={styles.th}>Doctor</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.appointment_id}>
                <td style={styles.td}>{a.patient_name}</td>
                <td style={styles.td}>{a.doctor_name}</td>
                <td style={styles.td}>{a.appointment_date}</td>
                <td style={styles.td}>
                  <span style={getBadgeStyle(a.status)}>{a.status}</span>
                </td>
                <td style={styles.td}>
                  <select value={a.status} onChange={(e) => handleStatusChange(a.appointment_id, e.target.value)} style={{ marginRight: "5px" }}>
                    <option>Pending</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                  <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => handleDelete(a.appointment_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");

  useEffect(() => {
    get("/departments").then(setDepartments);
  }, []);

  const handleAdd = async () => {
    if (newDept.trim()) {
      await post("/departments", { department_name: newDept });
      setNewDept("");
      get("/departments").then(setDepartments);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this department?")) {
      await del(`/departments/${id}`);
      get("/departments").then(setDepartments);
    }
  };

  return (
    <div>
      <h2>Departments</h2>
      <div style={styles.card}>
        <div style={{ marginBottom: "15px" }}>
          <input style={styles.input} value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="New department name" />
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleAdd}>Add</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Department Name</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.department_id}>
                <td style={styles.td}>{d.department_id}</td>
                <td style={styles.td}>{d.department_name}</td>
                <td style={styles.td}>
                  <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => handleDelete(d.department_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Bills() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    get("/bills").then(setBills);
  }, []);

  const handlePayment = async (id, status) => {
    await put(`/bills/${id}`, { payment_status: status });
    get("/bills").then(setBills);
  };

  const totalPaid = bills.filter((b) => b.payment_status === "Paid").reduce((s, b) => s + Number(b.total_amount), 0);
  const totalPending = bills.filter((b) => b.payment_status === "Pending").reduce((s, b) => s + Number(b.total_amount), 0);

  return (
    <div>
      <h2>Billing</h2>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ ...styles.statBox, background: "#27ae60" }}>
          <div style={styles.statNumber}>₹{totalPaid}</div>
          <div>Collected</div>
        </div>
        <div style={{ ...styles.statBox, background: "#e67e22" }}>
          <div style={styles.statNumber}>₹{totalPending}</div>
          <div>Pending</div>
        </div>
      </div>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Patient</th>
              <th style={styles.th}>Diagnosis</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.bill_id}>
                <td style={styles.td}>{b.patient_name}</td>
                <td style={styles.td}>{b.diagnosis}</td>
                <td style={styles.td}>₹{b.total_amount}</td>
                <td style={styles.td}>{b.payment_status}</td>
                <td style={styles.td}>
                  {b.payment_status === "Pending" ? (
                    <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => handlePayment(b.bill_id, "Paid")}>Mark Paid</button>
                  ) : (
                    <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => handlePayment(b.bill_id, "Pending")}>Mark Pending</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "patients":
        return <Patients />;
      case "doctors":
        return <Doctors />;
      case "appointments":
        return <Appointments />;
      case "departments":
        return <Departments />;
      case "bills":
        return <Bills />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={styles.header}>
        <h1>🏥 MediCore Hospital</h1>
        <p>Hospital Management System</p>
      </div>
      <div style={styles.container}>
        <div style={styles.nav}>
          <button
            style={page === "dashboard" ? { ...styles.navBtn, ...styles.navBtnActive } : styles.navBtn}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
          <button
            style={page === "patients" ? { ...styles.navBtn, ...styles.navBtnActive } : styles.navBtn}
            onClick={() => setPage("patients")}
          >
            Patients
          </button>
          <button
            style={page === "doctors" ? { ...styles.navBtn, ...styles.navBtnActive } : styles.navBtn}
            onClick={() => setPage("doctors")}
          >
            Doctors
          </button>
          <button
            style={page === "appointments" ? { ...styles.navBtn, ...styles.navBtnActive } : styles.navBtn}
            onClick={() => setPage("appointments")}
          >
            Appointments
          </button>
          <button
            style={page === "departments" ? { ...styles.navBtn, ...styles.navBtnActive } : styles.navBtn}
            onClick={() => setPage("departments")}
          >
            Departments
          </button>
          <button
            style={page === "bills" ? { ...styles.navBtn, ...styles.navBtnActive } : styles.navBtn}
            onClick={() => setPage("bills")}
          >
            Billing
          </button>
        </div>
        {renderPage()}
      </div>
    </div>
  );
}
