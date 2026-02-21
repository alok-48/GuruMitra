const db = require('../config/database');
const policySimplifier = require('../ai/policySimplifier');

function getUpdates(req, res) {
  const category = req.query.category;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let updates;
  if (category && category !== 'all') {
    updates = db.prepare(
      'SELECT * FROM government_updates WHERE category = ? AND is_verified = 1 ORDER BY published_at DESC LIMIT ? OFFSET ?'
    ).all(category, limit, offset);
  } else {
    updates = db.prepare(
      'SELECT * FROM government_updates WHERE is_verified = 1 ORDER BY published_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset);
  }

  const actionRequired = db.prepare(`
    SELECT * FROM government_updates
    WHERE action_required = 1 AND is_verified = 1
    AND (action_deadline IS NULL OR action_deadline > date('now'))
    ORDER BY action_deadline ASC
  `).all();

  res.json({ updates, actionRequired });
}

function getUpdateById(req, res) {
  const update = db.prepare('SELECT * FROM government_updates WHERE id = ?').get(req.params.id);
  if (!update) return res.status(404).json({ error: 'अपडेट नहीं मिला' });

  let actionSteps = [];
  try { actionSteps = JSON.parse(update.action_steps || '[]'); } catch (_) {}

  const simplification = policySimplifier.simplify(update.original_text, update.category);

  res.json({
    update: {
      ...update,
      action_steps: actionSteps,
    },
    aiAnalysis: simplification,
  });
}

function simplifyText(req, res) {
  const { text, category } = req.body;
  if (!text) return res.status(400).json({ error: 'टेक्स्ट दें' });

  const result = policySimplifier.simplify(text, category);
  res.json({ result });
}

module.exports = { getUpdates, getUpdateById, simplifyText };
