const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getPensionData, getPaymentHistory, requestBankHelp, checkFraud } = require('../controllers/pensionController');

const router = Router();

router.get('/', authenticate, getPensionData);
router.get('/payments', authenticate, getPaymentHistory);
router.post('/bank-help', authenticate, requestBankHelp);
router.post('/check-fraud', authenticate, checkFraud);

module.exports = router;
