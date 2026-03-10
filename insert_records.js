const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sonu@8205",
  database: "HospitalDB",
});

const diagnoses = [
  'Common Cold', 'Fever', 'Headache', 'Back Pain', 'Joint Pain',
  'High Blood Pressure', 'Diabetes', 'Asthma', 'Allergy', 'Infection',
  'Stomach Ache', 'Skin Rash', 'Eye Problem', 'Ear Pain', 'Throat Infection',
  'Heart Condition', 'Neurological Issue', 'Bone Fracture', 'Sports Injury', 'Chronic Pain'
];

const treatmentDetails = [
  'Prescribed medication', 'Physical therapy', 'Lab tests', 'X-Ray', 'MRI Scan',
  'Blood test', 'ECG', 'Ultrasound', 'Vaccination', 'Dressing',
  'Minor surgery', 'Consultation', 'Follow-up care', 'Lifestyle advice', 'Diet plan'
];

const statuses = ['Completed', 'Pending', 'Cancelled'];
const paymentStatuses = ['Paid', 'Pending'];

db.connect((err) => {
  if (err) {
    console.error('Error connecting:', err.message);
    return;
  }
  
  console.log('Connected to database. Generating appointments...');
  
  // Get patient and doctor counts
  db.query('SELECT COUNT(*) as count FROM Patient', (err, patientResult) => {
    if (err) {
      console.error('Error:', err.message);
      db.end();
      return;
    }
    const patientCount = patientResult[0].count;
    
    db.query('SELECT COUNT(*) as count FROM Doctor', (err, doctorResult) => {
      if (err) {
        console.error('Error:', err.message);
        db.end();
        return;
      }
      const doctorCount = doctorResult[0].count;
      
      console.log(`Found ${patientCount} patients and ${doctorCount} doctors`);
      
      // Generate 800 appointments (more than patients to have multiple per patient)
      const appointments = [];
      for (let i = 1; i <= 800; i++) {
        const patientId = Math.floor(Math.random() * patientCount) + 1;
        const doctorId = Math.floor(Math.random() * doctorCount) + 1;
        
        // Random date within last 6 months
        const daysAgo = Math.floor(Math.random() * 180);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const appointmentDate = date.toISOString().split('T')[0];
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        appointments.push([patientId, doctorId, appointmentDate, status]);
      }
      
      const appointmentSql = 'INSERT INTO Appointment (patient_id, doctor_id, appointment_date, status) VALUES ?';
      
      db.query(appointmentSql, [appointments], (err, result) => {
        if (err) {
          console.error('Error inserting appointments:', err.message);
        } else {
          console.log(`Successfully inserted ${result.affectedRows} appointments!`);
          
          // Now insert treatments for completed appointments
          db.query('SELECT appointment_id FROM Appointment WHERE status = "Completed" LIMIT 600', (err, appointmentResults) => {
            if (err) {
              console.error('Error getting appointments:', err.message);
              db.end();
              return;
            }
            
            console.log(`Generating treatments for ${appointmentResults.length} completed appointments...`);
            
            const treatments = [];
            for (let i = 0; i < appointmentResults.length; i++) {
              const appointmentId = appointmentResults[i].appointment_id;
              const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
              const treatmentDetail = treatmentDetails[Math.floor(Math.random() * treatmentDetails.length)];
              const cost = Math.floor(Math.random() * 5000) + 500;
              
              treatments.push([appointmentId, diagnosis, treatmentDetail, cost]);
            }
            
            const treatmentSql = 'INSERT INTO Treatment (appointment_id, diagnosis, treatment_details, cost) VALUES ?';
            
            db.query(treatmentSql, [treatments], (err, result) => {
              if (err) {
                console.error('Error inserting treatments:', err.message);
              } else {
                console.log(`Successfully inserted ${result.affectedRows} treatments!`);
                
                // Now insert bills
            db.query('SELECT treatment_id FROM Treatment', (err, treatmentResults) => {
                  if (err) {
                    console.error('Error getting treatments:', err.message);
                    db.end();
                    return;
                  }
                  
                  console.log(`Generating bills for ${treatmentResults.length} treatments...`);
                  
                  const bills = [];
                  for (let i = 0; i < treatmentResults.length; i++) {
                    const treatmentId = treatmentResults[i].treatment_id;
                    
                    // Random date within last 3 months
                    const daysAgo = Math.floor(Math.random() * 90);
                    const date = new Date();
                    date.setDate(date.getDate() - daysAgo);
                    const billDate = date.toISOString().split('T')[0];
                    
                    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
                    const totalAmount = Math.floor(Math.random() * 10000) + 1000;
                    
                    bills.push([treatmentId, totalAmount, billDate, paymentStatus]);
                  }
                  
                  const billSql = 'INSERT INTO Bill (treatment_id, total_amount, bill_date, payment_status) VALUES ?';
                  
                  db.query(billSql, [bills], (err, result) => {
                    if (err) {
                      console.error('Error inserting bills:', err.message);
                    } else {
                      console.log(`Successfully inserted ${result.affectedRows} bills!`);
                      console.log('\n=== Database Population Complete ===');
                      console.log('- 10 Departments');
                      console.log('- 40 Doctors');
                      console.log('- 500 Patients');
                      console.log('- 800 Appointments');
                      console.log('- ' + treatmentResults.length + ' Treatments');
                      console.log('- ' + result.affectedRows + ' Bills');
                    }
                    db.end();
                  });
                });
              }
            });
          });
        }
      });
    });
  });
});
