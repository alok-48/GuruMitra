const db = require('./database');

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher',
  date_of_birth TEXT,
  language TEXT DEFAULT 'hi',
  district TEXT,
  state TEXT DEFAULT 'Madhya Pradesh',
  profile_photo TEXT,
  emergency_contact TEXT,
  linked_teacher_id TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  is_used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS health_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  doctor_name TEXT,
  hospital TEXT,
  record_date TEXT,
  file_path TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_health_user ON health_records(user_id);

CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  times TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS medicine_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  taken_at TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_medlog_user ON medicine_logs(user_id);

CREATE TABLE IF NOT EXISTS pension_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pension_type TEXT DEFAULT 'government',
  ppo_number TEXT,
  bank_name TEXT,
  bank_account TEXT,
  monthly_amount REAL,
  last_credited_date TEXT,
  last_credited_amount REAL,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pension_user ON pension_data(user_id);

CREATE TABLE IF NOT EXISTS pension_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pension_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  credited_date TEXT NOT NULL,
  month_year TEXT NOT NULL,
  status TEXT DEFAULT 'credited',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  ocr_text TEXT,
  expiry_date TEXT,
  tags TEXT,
  is_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_docs_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_category ON documents(category);

CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_type TEXT DEFAULT 'text',
  content TEXT,
  media_path TEXT,
  group_id TEXT,
  likes_count INTEGER DEFAULT 0,
  is_approved INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON community_posts(user_id);

CREATE TABLE IF NOT EXISTS community_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT DEFAULT 'batch',
  created_by TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS government_updates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_text TEXT,
  simplified_text TEXT,
  category TEXT,
  action_required INTEGER DEFAULT 0,
  action_deadline TEXT,
  action_steps TEXT,
  source_url TEXT,
  is_verified INTEGER DEFAULT 1,
  published_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_govupdates_cat ON government_updates(category);

CREATE TABLE IF NOT EXISTS help_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  urgency TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  assigned_volunteer_id TEXT,
  location TEXT,
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_help_user ON help_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_help_status ON help_requests(status);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  remind_at TEXT NOT NULL,
  repeat_pattern TEXT,
  is_sent INTEGER DEFAULT 0,
  is_dismissed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders(remind_at);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',
  is_read INTEGER DEFAULT 0,
  action_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS volunteers (
  user_id TEXT PRIMARY KEY,
  skills TEXT,
  availability TEXT,
  district TEXT,
  is_available INTEGER DEFAULT 1,
  rating REAL DEFAULT 5.0,
  total_helps INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  is_resolved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`;

async function initDatabase() {
  await db.initDb();
  db.exec(schema);
  console.log('Database schema initialized.');
}

module.exports = initDatabase;
