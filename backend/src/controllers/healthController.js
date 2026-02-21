const db = require('../config/database');
const { generateId } = require('../utils/helpers');
const reminderEngine = require('../ai/reminderEngine');

function getMedicines(req, res) {
  const medicines = db.prepare(
    'SELECT * FROM medicines WHERE user_id = ? AND is_active = 1 ORDER BY name'
  ).all(req.user.id);
  res.json({ medicines });
}

function addMedicine(req, res) {
  const { name, dosage, frequency, times, start_date, end_date } = req.body;
  if (!name || !times) return res.status(400).json({ error: 'दवाई का नाम और समय बताएं' });

  const id = generateId();
  db.prepare(
    'INSERT INTO medicines (id, user_id, name, dosage, frequency, times, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.id, name, dosage || '', frequency || 'daily', times, start_date || new Date().toISOString().split('T')[0], end_date || null);

  res.json({ success: true, id, message: `${name} दवाई जोड़ दी गई` });
}

function logMedicineIntake(req, res) {
  const { medicine_id, status } = req.body;
  if (!medicine_id) return res.status(400).json({ error: 'Medicine ID required' });

  db.prepare(
    'INSERT INTO medicine_logs (medicine_id, user_id, scheduled_time, taken_at, status) VALUES (?, ?, datetime("now"), ?, ?)'
  ).run(medicine_id, req.user.id, status === 'taken' ? new Date().toISOString() : null, status || 'taken');

  res.json({ success: true, message: status === 'taken' ? '✅ दवाई ली गई' : '⏭️ दवाई छोड़ दी गई' });
}

function getHealthRecords(req, res) {
  const records = db.prepare(
    'SELECT * FROM health_records WHERE user_id = ? ORDER BY record_date DESC'
  ).all(req.user.id);
  res.json({ records });
}

function addHealthRecord(req, res) {
  const { record_type, title, description, doctor_name, hospital, record_date } = req.body;
  if (!title || !record_type) return res.status(400).json({ error: 'रिकॉर्ड का प्रकार और शीर्षक बताएं' });

  const id = generateId();
  db.prepare(
    `INSERT INTO health_records (id, user_id, record_type, title, description, doctor_name, hospital, record_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, req.user.id, record_type, title, description || '', doctor_name || '', hospital || '', record_date || new Date().toISOString().split('T')[0]);

  res.json({ success: true, id, message: 'स्वास्थ्य रिकॉर्ड जोड़ दिया गया' });
}

function getHealthAlerts(req, res) {
  const alerts = reminderEngine.generateHealthAlerts(req.user.id);
  const missedPattern = reminderEngine.detectMissedPattern(req.user.id);
  const adherence = reminderEngine.getAdherenceScore(req.user.id);

  res.json({
    alerts,
    missedPattern,
    adherenceScore: Math.round(adherence * 100),
    adaptiveReminders: reminderEngine.createAdaptiveReminders(req.user.id),
  });
}

function getHealthTimeline(req, res) {
  const records = db.prepare(`
    SELECT 'health' as source, id, title, description, record_date as date, record_type as subtype
    FROM health_records WHERE user_id = ?
    UNION ALL
    SELECT 'medicine' as source, ml.id, m.name as title,
      CASE ml.status WHEN 'taken' THEN 'दवाई ली गई' WHEN 'missed' THEN 'दवाई छूट गई' ELSE ml.status END as description,
      ml.scheduled_time as date, 'intake' as subtype
    FROM medicine_logs ml JOIN medicines m ON ml.medicine_id = m.id
    WHERE ml.user_id = ? AND ml.created_at > datetime('now', '-7 days')
    ORDER BY date DESC LIMIT 50
  `).all(req.user.id, req.user.id);

  res.json({ timeline: records });
}

module.exports = { getMedicines, addMedicine, logMedicineIntake, getHealthRecords, addHealthRecord, getHealthAlerts, getHealthTimeline };
