const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');

const router = Router();

router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markAllRead);
router.put('/:id/read', authenticate, markRead);

module.exports = router;
