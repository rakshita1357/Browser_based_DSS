const express = require('express');
const router = express.Router();
const { getCurrentSchedule } = require('../controllers/scheduleController');

router.get('/current', getCurrentSchedule);

module.exports = router;