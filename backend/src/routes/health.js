const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getMedicines, addMedicine, logMedicineIntake,
  getHealthRecords, addHealthRecord, getHealthAlerts, getHealthTimeline
} = require('../controllers/healthController');

const router = Router();

router.get('/medicines', authenticate, getMedicines);
router.post('/medicines', authenticate, addMedicine);
router.post('/medicines/log', authenticate, logMedicineIntake);
router.get('/records', authenticate, getHealthRecords);
router.post('/records', authenticate, addHealthRecord);
router.get('/alerts', authenticate, getHealthAlerts);
router.get('/timeline', authenticate, getHealthTimeline);

module.exports = router;
