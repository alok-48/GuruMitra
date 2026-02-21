const { Router } = require('express');
const { getDashboard } = require('../controllers/homeController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/dashboard', authenticate, getDashboard);

module.exports = router;
