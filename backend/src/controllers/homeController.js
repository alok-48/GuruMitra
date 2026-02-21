const db = require('../config/database');
const { getGreeting } = require('../utils/helpers');
const reminderEngine = require('../ai/reminderEngine');

function getDashboard(req, res) {
  const userId = req.user.id;
  const userName = req.user.name;

  const todayReminders = db.prepare(`
    SELECT * FROM reminders WHERE user_id = ? AND is_dismissed = 0
    AND date(remind_at) = date('now') ORDER BY remind_at ASC LIMIT 5
  `).all(userId);

  const pension = db.prepare(`
    SELECT status, last_credited_date, last_credited_amount, monthly_amount
    FROM pension_data WHERE user_id = ? LIMIT 1
  `).get(userId);

  const activeMedicines = db.prepare(
    'SELECT name, dosage, times FROM medicines WHERE user_id = ? AND is_active = 1'
  ).all(userId);

  const healthAlerts = reminderEngine.generateHealthAlerts(userId);

  const updates = db.prepare(`
    SELECT id, title, simplified_text, category, action_required, published_at
    FROM government_updates ORDER BY published_at DESC LIMIT 3
  `).all();

  const unreadNotifications = db.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
  ).get(userId)?.count || 0;

  const openHelp = db.prepare(
    `SELECT COUNT(*) as count FROM help_requests WHERE user_id = ? AND status IN ('open','assigned','in_progress')`
  ).get(userId)?.count || 0;

  res.json({
    greeting: `${getGreeting()}, ${userName} जी!`,
    date: new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    reminders: todayReminders,
    pension: pension ? {
      status: pension.status,
      statusText: pension.status === 'active' ? '✅ पेंशन सामान्य' : '⚠️ ध्यान दें',
      lastAmount: pension.last_credited_amount,
      lastDate: pension.last_credited_date,
      monthlyAmount: pension.monthly_amount,
    } : null,
    medicines: activeMedicines,
    healthAlerts,
    governmentUpdates: updates,
    unreadNotifications,
    openHelpRequests: openHelp,
  });
}

module.exports = { getDashboard };
