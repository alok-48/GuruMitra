const { Router } = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { getUpdates, getUpdateById, simplifyText } = require('../controllers/govUpdateController');

const router = Router();

router.get('/', optionalAuth, getUpdates);
router.get('/:id', optionalAuth, getUpdateById);
router.post('/simplify', authenticate, simplifyText);

module.exports = router;
