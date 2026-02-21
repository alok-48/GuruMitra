const db = require('../config/database');

function getNotifications(req, res) {
  const notifications = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.user.id);

  const unread = db.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
  ).get(req.user.id)?.count || 0;

  res.json({ notifications, unreadCount: unread });
}

function markRead(req, res) {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
}

function markAllRead(req, res) {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(req.user.id);
  res.json({ success: true, message: 'सभी सूचनाएं पढ़ी गईं' });
}

module.exports = { getNotifications, markRead, markAllRead };
