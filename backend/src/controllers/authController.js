const db = require('../config/database');
const jwt = require('jsonwebtoken');
const { generateOTP, generateId, sanitizePhone } = require('../utils/helpers');

function sendOTP(req, res) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'फ़ोन नंबर डालें' });

  const cleanPhone = sanitizePhone(phone);
  if (cleanPhone.length !== 10) return res.status(400).json({ error: 'सही फ़ोन नंबर डालें (10 अंक)' });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60000)).toISOString();

  db.prepare('INSERT INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)').run(cleanPhone, otp, expiresAt);

  // In production: integrate SMS gateway (MSG91, Twilio)
  console.log(`[DEV] OTP for ${cleanPhone}: ${otp}`);

  res.json({
    success: true,
    message: 'OTP भेज दिया गया है',
    // Remove in production — only for development
    devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
  });
}

function verifyOTP(req, res) {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'फ़ोन नंबर और OTP दोनों डालें' });

  const cleanPhone = sanitizePhone(phone);
  const record = db.prepare(
    `SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND is_used = 0
     AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`
  ).get(cleanPhone, otp);

  if (!record) {
    return res.status(401).json({ error: 'OTP गलत है या समय समाप्त हो गया' });
  }

  db.prepare('UPDATE otp_codes SET is_used = 1 WHERE id = ?').run(record.id);

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
  let isNew = false;

  if (!user) {
    isNew = true;
    const userId = generateId();
    db.prepare('INSERT INTO users (id, phone, name, role) VALUES (?, ?, ?, ?)').run(
      userId, cleanPhone, 'नया सदस्य', 'teacher'
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

  db.prepare(`INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)`).run(
    user.id, 'login', `OTP login from phone ${cleanPhone}`
  );

  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, phone: user.phone, role: user.role, language: user.language, isNew },
    message: isNew ? 'स्वागत है! कृपया अपना नाम बताएं।' : `${user.name} जी, स्वागत है!`,
  });
}

function updateProfile(req, res) {
  const { name, date_of_birth, language, district, emergency_contact } = req.body;
  const userId = req.user.id;

  const fields = [];
  const values = [];
  if (name) { fields.push('name = ?'); values.push(name); }
  if (date_of_birth) { fields.push('date_of_birth = ?'); values.push(date_of_birth); }
  if (language) { fields.push('language = ?'); values.push(language); }
  if (district) { fields.push('district = ?'); values.push(district); }
  if (emergency_contact) { fields.push('emergency_contact = ?'); values.push(emergency_contact); }

  if (fields.length === 0) return res.status(400).json({ error: 'कोई जानकारी अपडेट करने के लिए दें' });

  fields.push("updated_at = datetime('now')");
  values.push(userId);

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT id, name, phone, role, date_of_birth, language, district, emergency_contact FROM users WHERE id = ?').get(userId);
  res.json({ success: true, user: updated, message: 'जानकारी अपडेट हो गई' });
}

function getProfile(req, res) {
  const user = db.prepare(
    'SELECT id, name, phone, role, date_of_birth, language, district, state, emergency_contact, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  res.json({ user });
}

module.exports = { sendOTP, verifyOTP, updateProfile, getProfile };
