const db = require('./database');
const initDatabase = require('./initDb');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  await initDatabase();

  const teacherId = uuidv4();
  const familyId = uuidv4();
  const volunteerId = uuidv4();
  const adminId = uuidv4();

  db.prepare('INSERT OR IGNORE INTO users (id, phone, name, role, date_of_birth, language, district, state, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    teacherId, '9876543210', 'Ramesh Kumar Sharma', 'teacher', '1955-03-15', 'hi', 'Bhopal', 'Madhya Pradesh', '9876543211'
  );
  db.prepare('INSERT OR IGNORE INTO users (id, phone, name, role, linked_teacher_id) VALUES (?, ?, ?, ?, ?)').run(
    familyId, '9876543211', 'Suresh Sharma', 'family', teacherId
  );
  db.prepare('INSERT OR IGNORE INTO users (id, phone, name, role, district) VALUES (?, ?, ?, ?, ?)').run(
    volunteerId, '9876543212', 'Priya Verma', 'volunteer', 'Bhopal'
  );
  db.prepare('INSERT OR IGNORE INTO users (id, phone, name, role) VALUES (?, ?, ?, ?)').run(
    adminId, '9876543200', 'Admin User', 'admin'
  );

  db.prepare('INSERT OR IGNORE INTO volunteers (user_id, skills, availability, district) VALUES (?, ?, ?, ?)').run(
    volunteerId, 'document_help,bank_help,tech_support', 'weekdays', 'Bhopal'
  );

  const pensionId = uuidv4();
  db.prepare('INSERT INTO pension_data (id, user_id, pension_type, ppo_number, bank_name, bank_account, monthly_amount, last_credited_date, last_credited_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    pensionId, teacherId, 'government', 'PPO/2015/123456', 'State Bank of India', 'XXXX1234', 35000, '2026-01-28', 35000, 'active'
  );

  for (let i = 0; i < 6; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    db.prepare('INSERT INTO pension_payments (pension_id, user_id, amount, credited_date, month_year, status) VALUES (?, ?, ?, ?, ?, ?)').run(
      pensionId, teacherId, 35000, `${monthStr}-28`, monthStr, 'credited'
    );
  }

  const med1Id = uuidv4();
  const med2Id = uuidv4();
  db.prepare('INSERT INTO medicines (id, user_id, name, dosage, frequency, times, start_date) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    med1Id, teacherId, 'Amlodipine', '5mg', 'daily', '08:00', '2025-01-01'
  );
  db.prepare('INSERT INTO medicines (id, user_id, name, dosage, frequency, times, start_date) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    med2Id, teacherId, 'Metformin', '500mg', 'twice_daily', '08:00,20:00', '2025-01-01'
  );

  const groupId = uuidv4();
  db.prepare('INSERT INTO community_groups (id, name, description, group_type, created_by, member_count) VALUES (?, ?, ?, ?, ?, ?)').run(
    groupId, '1985 Batch - Bhopal', 'Teachers who joined service in 1985 batch from Bhopal district', 'batch', teacherId, 1
  );
  db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)').run(groupId, teacherId);

  db.prepare('INSERT INTO community_posts (id, user_id, post_type, content, group_id) VALUES (?, ?, ?, ?, ?)').run(
    uuidv4(), teacherId, 'memory', 'याद है वो दिन जब हम सब ने पहली बार स्कूल में साइंस फेयर आयोजित किया था? क्या दिन थे वो! 🎓', groupId
  );

  db.prepare('INSERT INTO government_updates (id, title, original_text, simplified_text, category, action_required, action_steps) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    uuidv4(),
    'DA Increase for Pensioners - January 2026',
    'The Government has decided to increase the Dearness Allowance to Central Government pensioners/family pensioners from the existing rate of 50% to 53% of the Basic Pension/Family Pension...',
    'आपकी पेंशन में महंगाई भत्ता (DA) 50% से बढ़कर 53% हो गया है। इसका मतलब है कि आपको हर महीने पहले से ज़्यादा पेंशन मिलेगी। यह बढ़ोतरी जनवरी 2026 से लागू है।',
    'pension', 0, null
  );

  db.prepare('INSERT INTO government_updates (id, title, original_text, simplified_text, category, action_required, action_deadline, action_steps) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    uuidv4(),
    'Life Certificate Submission Deadline',
    'All pensioners are required to submit their Digital Life Certificate (Jeevan Pramaan) by November 30, 2026...',
    'आपको अपना जीवन प्रमाण पत्र (Life Certificate) 30 नवंबर 2026 तक जमा करना है। यह हर साल करना ज़रूरी है ताकि आपकी पेंशन जारी रहे।',
    'pension', 1, '2026-11-30',
    JSON.stringify(['अपने नज़दीकी बैंक या CSC सेंटर जाएं', 'आधार कार्ड साथ ले जाएं', 'अंगुली का निशान या आँखों का स्कैन दें', 'रसीद ज़रूर लें'])
  );

  db.prepare('INSERT INTO reminders (id, user_id, type, title, description, remind_at, repeat_pattern) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    uuidv4(), teacherId, 'medicine', 'सुबह की दवाई लें', 'Amlodipine 5mg और Metformin 500mg', '2026-02-23T08:00:00', 'daily'
  );
  db.prepare('INSERT INTO reminders (id, user_id, type, title, description, remind_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    uuidv4(), teacherId, 'pension', 'पेंशन जमा होने की तारीख', 'इस महीने की पेंशन 28 तारीख को आएगी', '2026-02-28T09:00:00'
  );

  db.prepare('INSERT INTO notifications (id, user_id, title, body, type) VALUES (?, ?, ?, ?, ?)').run(
    uuidv4(), teacherId, 'स्वागत है!', 'गुरुमित्र में आपका स्वागत है। यहाँ आपकी सेवा में हम हमेशा तैयार हैं।', 'info'
  );

  db.save();
  console.log('Seed data inserted successfully.');
  console.log(`Teacher ID: ${teacherId}`);
  console.log('Demo phone: 9876543210');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
