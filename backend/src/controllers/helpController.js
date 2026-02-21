const db = require('../config/database');
const { generateId } = require('../utils/helpers');
const helpClassifier = require('../ai/helpClassifier');

function createHelpRequest(req, res) {
  const { description, category } = req.body;
  if (!description && !category) return res.status(400).json({ error: 'कृपया बताएं कि क्या मदद चाहिए' });

  const classification = helpClassifier.classify(description || category || '');
  const finalCategory = category || classification.category;
  const urgency = classification.urgency;

  const userAge = req.user.date_of_birth
    ? Math.floor((Date.now() - new Date(req.user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const priorityScore = helpClassifier.getPriorityScore({
    category: finalCategory,
    urgency,
    userAge,
  });

  const id = generateId();
  db.prepare(`
    INSERT INTO help_requests (id, user_id, category, description, urgency, status, location)
    VALUES (?, ?, ?, ?, ?, 'open', ?)
  `).run(id, req.user.id, finalCategory, description || '', urgency, req.body.location || null);

  if (urgency === 'critical' || urgency === 'high') {
    const volunteer = db.prepare(`
      SELECT v.user_id, u.name FROM volunteers v
      JOIN users u ON v.user_id = u.id
      WHERE v.is_available = 1 AND v.district = ?
      ORDER BY v.rating DESC LIMIT 1
    `).get(req.user.district || '');

    if (volunteer) {
      db.prepare('UPDATE help_requests SET assigned_volunteer_id = ?, status = ? WHERE id = ?')
        .run(volunteer.user_id, 'assigned', id);

      db.prepare('INSERT INTO notifications (id, user_id, title, body, type) VALUES (?, ?, ?, ?, ?)')
        .run(generateId(), volunteer.user_id, '🆘 नई मदद का अनुरोध', `${req.user.name} जी को ${finalCategory} में मदद चाहिए`, 'sos');
    }

    if (req.user.emergency_contact) {
      db.prepare('INSERT INTO notifications (id, user_id, title, body, type) VALUES (?, ?, ?, ?, ?)')
        .run(generateId(), req.user.id, '🔔 परिवार को सूचना भेजी गई', 'आपकी आपातकालीन स्थिति की सूचना परिवार को भेज दी गई है', 'alert');
    }
  }

  const responseMessages = {
    critical: '🚨 आपातकालीन मदद तुरंत भेजी जा रही है!',
    high: '⚡ जल्द ही कोई आपकी मदद के लिए आएगा।',
    normal: '✅ आपका अनुरोध दर्ज हो गया है। जल्द संपर्क किया जाएगा।',
    low: '📝 आपका अनुरोध दर्ज हो गया है।',
  };

  res.json({
    success: true,
    id,
    classification: { category: finalCategory, urgency, priorityScore },
    message: responseMessages[urgency] || responseMessages.normal,
  });
}

function getMyRequests(req, res) {
  const requests = db.prepare(`
    SELECT hr.*, u.name as volunteer_name
    FROM help_requests hr
    LEFT JOIN users u ON hr.assigned_volunteer_id = u.id
    WHERE hr.user_id = ?
    ORDER BY hr.created_at DESC
  `).all(req.user.id);

  res.json({ requests });
}

function getRequestById(req, res) {
  const request = db.prepare(`
    SELECT hr.*, u.name as volunteer_name, u.phone as volunteer_phone
    FROM help_requests hr
    LEFT JOIN users u ON hr.assigned_volunteer_id = u.id
    WHERE hr.id = ? AND (hr.user_id = ? OR hr.assigned_volunteer_id = ?)
  `).get(req.params.id, req.user.id, req.user.id);

  if (!request) return res.status(404).json({ error: 'अनुरोध नहीं मिला' });
  res.json({ request });
}

function updateRequestStatus(req, res) {
  const { status } = req.body;
  const allowed = ['in_progress', 'resolved', 'closed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const request = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const updates = status === 'resolved'
    ? "status = ?, resolved_at = datetime('now'), updated_at = datetime('now')"
    : "status = ?, updated_at = datetime('now')";

  db.prepare(`UPDATE help_requests SET ${updates} WHERE id = ?`).run(status, req.params.id);

  if (status === 'resolved' && request.assigned_volunteer_id) {
    db.prepare('UPDATE volunteers SET total_helps = total_helps + 1 WHERE user_id = ?')
      .run(request.assigned_volunteer_id);
  }

  res.json({ success: true, message: 'स्थिति अपडेट हो गई' });
}

function sosEmergency(req, res) {
  const id = generateId();
  db.prepare(`
    INSERT INTO help_requests (id, user_id, category, description, urgency, status, location)
    VALUES (?, ?, 'emergency', ?, 'critical', 'open', ?)
  `).run(id, req.user.id, req.body.description || 'SOS आपातकालीन मदद', req.body.location || null);

  db.prepare('INSERT INTO notifications (id, user_id, title, body, type) VALUES (?, ?, ?, ?, ?)').run(
    generateId(), req.user.id, '🚨 SOS भेजा गया', 'आपकी मदद के लिए सूचना भेज दी गई है', 'sos'
  );

  res.json({
    success: true,
    id,
    message: '🚨 SOS भेज दिया गया! मदद रास्ते में है।',
  });
}

module.exports = { createHelpRequest, getMyRequests, getRequestById, updateRequestStatus, sosEmergency };
