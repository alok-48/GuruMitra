const db = require('../config/database');
const { generateId } = require('../utils/helpers');
const documentAI = require('../ai/documentAI');
const path = require('path');

function getDocuments(req, res) {
  const category = req.query.category;
  let docs;
  if (category && category !== 'all') {
    docs = db.prepare('SELECT * FROM documents WHERE user_id = ? AND category = ? ORDER BY created_at DESC').all(req.user.id, category);
  } else {
    docs = db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  }

  const categoryCounts = db.prepare(`
    SELECT category, COUNT(*) as count FROM documents WHERE user_id = ? GROUP BY category
  `).all(req.user.id);

  res.json({ documents: docs, categoryCounts });
}

function uploadDocument(req, res) {
  if (!req.file) return res.status(400).json({ error: 'कृपया फ़ाइल अपलोड करें' });

  const { title, category } = req.body;
  const file = req.file;

  const aiResult = documentAI.categorizeDocument(file.originalname, '');
  const finalCategory = category || aiResult.category;
  const finalTitle = title || aiResult.suggestedName;
  const tags = documentAI.suggestTags(finalCategory);

  const id = generateId();
  db.prepare(`
    INSERT INTO documents (id, user_id, title, category, file_path, file_type, file_size, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, finalTitle, finalCategory, file.path, file.mimetype, file.size, JSON.stringify(tags));

  res.json({
    success: true,
    id,
    document: {
      id, title: finalTitle, category: finalCategory,
      aiSuggestion: aiResult,
      tags,
    },
    message: 'दस्तावेज़ सुरक्षित रूप से जमा हो गया',
  });
}

function getDocumentById(req, res) {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!doc) return res.status(404).json({ error: 'दस्तावेज़ नहीं मिला' });
  res.json({ document: doc });
}

function deleteDocument(req, res) {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!doc) return res.status(404).json({ error: 'दस्तावेज़ नहीं मिला' });

  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'दस्तावेज़ हटा दिया गया' });
}

function getDeadlines(req, res) {
  const docs = db.prepare(`
    SELECT id, title, category, expiry_date FROM documents
    WHERE user_id = ? AND expiry_date IS NOT NULL AND expiry_date > date('now')
    ORDER BY expiry_date ASC LIMIT 10
  `).all(req.user.id);

  res.json({ deadlines: docs });
}

module.exports = { getDocuments, uploadDocument, getDocumentById, deleteDocument, getDeadlines };
