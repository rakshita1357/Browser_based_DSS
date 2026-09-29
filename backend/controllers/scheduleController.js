const pool = require('../db/pool');
const { decideCurrentAd, ROTATION_INTERVAL_MINUTES } = require('../services/scheduler');
const { formatIST } = require('../utils/formatTime');

async function getCurrentSchedule(req, res) {
  try {
    const [activeAds] = await pool.query(
      `SELECT * FROM ads
       WHERE status = 'active' AND start_time <= NOW() AND end_time > NOW()
       ORDER BY id ASC`
    );

    const decision = decideCurrentAd(activeAds, new Date());

    res.json({
      ...decision,
      activeCount: activeAds.length,
      rotationIntervalMinutes: ROTATION_INTERVAL_MINUTES,
      serverTime: formatIST(new Date()),
      nextSwitchAt: decision.nextSwitchAt ? formatIST(decision.nextSwitchAt) : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCurrentSchedule };