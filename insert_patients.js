const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sonu@8205",
  database: "HospitalDB",
});

const firstNames = ['John', 'Emily', 'Michael', 'Sarah', 'David', 'Jessica', 'James', 'Jennifer', 'Robert', 'Linda',
  'William', 'Elizabeth', 'Christopher', 'Maria', 'Daniel', 'Patricia', 'Matthew', 'Barbara', 'Anthony', 'Susan',
  'Mark', 'Nancy', 'Paul', 'Lisa', 'Andrew', 'Sandra', 'Joseph', 'Michelle', 'Kevin', 'Donna',
  'Brian', 'Carol', 'George', 'Helen', 'Ronald', 'Margaret', 'Peter', 'Cynthia', 'Jason', 'Sharon',
  'Timothy', 'Angela', 'Jeffrey', 'Ruth', 'Gary', 'Virginia', 'Dennis', 'Stephanie', 'Eric', 'Catherine'];

const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Taylor', 'Anderson', 'Martinez', 'Thompson', 'Garcia',
  'Rodriguez', 'Lee', 'Walker', 'Hernandez', 'Lopez', 'Gonzalez', 'Miller', 'Davis', 'Martinez', 'Anderson',
  'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Young', 'Allen',
  'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson',
  'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans'];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Coimbatore', 'Kochi', 'Visakhapatnam', 'Vijayawada', 'Madurai', 'Mysore',
  'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Thanjavur', 'Dindigul', 'Nagercoil', 'Kanchipuram', 'Tuticorin', 'Vellore',
  'Tirunelveli', 'Nizamuddin', 'Faridabad', 'Ghaziabad', 'Allahabad', 'Ranchi', 'Jabalpur', 'Ludhiana', 'Amritsar', 'Jamshedpur',
  'Jodhpur', 'Kota', 'Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Konark', 'Berhampur', 'Balasore', 'Sambalpur'];

const genders = ['Male', 'Female'];

// Generate 500 patients
const patients = [];
for (let i = 1; i <= 500; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const age = Math.floor(Math.random() * (75 - 18 + 1)) + 18;
  const gender = genders[Math.floor(Math.random() * genders.length)];
  const phone = '9' + String(Math.floor(Math.random() * 900000000 + 100000000));
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  patients.push([`${firstName} ${lastName}`, age, gender, phone, `${Math.floor(Math.random() * 999) + 1} ${city} Street, ${city}`]);
}

db.connect((err) => {
  if (err) {
    console.error('Error connecting:', err.message);
    return;
  }
  
  console.log('Connected to database. Inserting patients...');
  
  const sql = 'INSERT INTO Patient (name, age, gender, phone, address) VALUES ?';
  
  db.query(sql, [patients], (err, result) => {
    if (err) {
      console.error('Error inserting patients:', err.message);
    } else {
      console.log(`Successfully inserted ${result.affectedRows} patients!`);
    }
    db.end();
  });
});
