const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { createHelpRequest, getMyRequests, getRequestById, updateRequestStatus, sosEmergency } = require('../controllers/helpController');

const router = Router();

router.post('/', authenticate, createHelpRequest);
router.get('/my', authenticate, getMyRequests);
router.post('/sos', authenticate, sosEmergency);
router.get('/:id', authenticate, getRequestById);
router.put('/:id/status', authenticate, updateRequestStatus);

module.exports = router;
