const db = require('../config/database');
const { generateId } = require('../utils/helpers');

function getPosts(req, res) {
  const groupId = req.query.group_id;
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  let posts;
  if (groupId) {
    posts = db.prepare(`
      SELECT cp.*, u.name as author_name, u.profile_photo
      FROM community_posts cp JOIN users u ON cp.user_id = u.id
      WHERE cp.group_id = ? AND cp.is_approved = 1
      ORDER BY cp.created_at DESC LIMIT ? OFFSET ?
    `).all(groupId, limit, offset);
  } else {
    posts = db.prepare(`
      SELECT cp.*, u.name as author_name, u.profile_photo
      FROM community_posts cp JOIN users u ON cp.user_id = u.id
      WHERE cp.is_approved = 1
      ORDER BY cp.created_at DESC LIMIT ? OFFSET ?
    `).all(limit, offset);
  }

  res.json({ posts });
}

function createPost(req, res) {
  const { content, post_type, group_id } = req.body;
  if (!content && !req.file) return res.status(400).json({ error: 'कुछ लिखें या फ़ोटो/आवाज़ भेजें' });

  const id = generateId();
  db.prepare(`
    INSERT INTO community_posts (id, user_id, post_type, content, media_path, group_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, post_type || 'text', content || '', req.file?.path || null, group_id || null);

  res.json({ success: true, id, message: 'आपकी पोस्ट हो गई! 👍' });
}

function likePost(req, res) {
  db.prepare('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

function getGroups(req, res) {
  const myGroups = db.prepare(`
    SELECT cg.* FROM community_groups cg
    JOIN group_members gm ON cg.id = gm.group_id
    WHERE gm.user_id = ?
  `).all(req.user.id);

  const otherGroups = db.prepare(`
    SELECT * FROM community_groups WHERE id NOT IN (
      SELECT group_id FROM group_members WHERE user_id = ?
    ) LIMIT 10
  `).all(req.user.id);

  res.json({ myGroups, suggestedGroups: otherGroups });
}

function joinGroup(req, res) {
  const groupId = req.params.id;
  const exists = db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?').get(groupId, req.user.id);
  if (exists) return res.json({ message: 'आप पहले से इस समूह में हैं' });

  db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)').run(groupId, req.user.id);
  db.prepare('UPDATE community_groups SET member_count = member_count + 1 WHERE id = ?').run(groupId);

  res.json({ success: true, message: 'समूह में शामिल हो गए! 🎉' });
}

function getEvents(req, res) {
  const events = db.prepare(`
    SELECT * FROM community_posts WHERE post_type = 'event'
    AND is_approved = 1 ORDER BY created_at DESC LIMIT 10
  `).all();
  res.json({ events });
}

module.exports = { getPosts, createPost, likePost, getGroups, joinGroup, getEvents };
