const db = require('../config/database');
const fraudDetector = require('../ai/fraudDetector');

function getPensionData(req, res) {
  const pension = db.prepare('SELECT * FROM pension_data WHERE user_id = ?').get(req.user.id);
  if (!pension) return res.json({ pension: null, message: 'पेंशन जानकारी अभी दर्ज नहीं है' });

  const payments = db.prepare(
    'SELECT * FROM pension_payments WHERE pension_id = ? ORDER BY credited_date DESC LIMIT 12'
  ).all(pension.id);

  const analysis = fraudDetector.analyzePensionPattern(req.user.id, payments);

  res.json({
    pension: {
      ...pension,
      statusText: {
        active: '✅ पेंशन सामान्य रूप से आ रही है',
        delayed: '⏳ पेंशन में देरी हो रही है',
        issue: '⚠️ पेंशन में कोई समस्या है',
        stopped: '🚫 पेंशन रुकी हुई है',
      }[pension.status] || pension.status,
    },
    payments,
    analysis,
  });
}

function getPaymentHistory(req, res) {
  const pension = db.prepare('SELECT id FROM pension_data WHERE user_id = ?').get(req.user.id);
  if (!pension) return res.json({ payments: [] });

  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  const payments = db.prepare(
    'SELECT * FROM pension_payments WHERE pension_id = ? ORDER BY credited_date DESC LIMIT ? OFFSET ?'
  ).all(pension.id, limit, offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM pension_payments WHERE pension_id = ?').get(pension.id)?.count || 0;

  res.json({ payments, total, page, pages: Math.ceil(total / limit) });
}

function requestBankHelp(req, res) {
  const { description } = req.body;
  const { generateId } = require('../utils/helpers');
  const helpClassifier = require('../ai/helpClassifier');

  const classification = helpClassifier.classify(description || 'bank help');
  const id = generateId();

  db.prepare(
    `INSERT INTO help_requests (id, user_id, category, description, urgency, status)
     VALUES (?, ?, 'bank', ?, ?, 'open')`
  ).run(id, req.user.id, description || 'बैंक संबंधी मदद चाहिए', classification.urgency);

  res.json({
    success: true,
    id,
    message: 'बैंक मदद का अनुरोध भेज दिया गया है। जल्द ही कोई संपर्क करेगा।',
  });
}

function checkFraud(req, res) {
  const { message } = req.body;
  const result = fraudDetector.analyzeMessage(message);
  res.json(result);
}

module.exports = { getPensionData, getPaymentHistory, requestBankHelp, checkFraud };
