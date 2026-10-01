const express = require('express');
const router = express.Router();
const { getCurrentSchedule, getZonedSchedule } = require('../controllers/scheduleController');

router.get('/current', getCurrentSchedule);
router.get('/zones', getZonedSchedule);

module.exports = router;