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

async function getZonedSchedule(req, res) {
  try {
    const [allActive] = await pool.query(
      `SELECT * FROM ads
       WHERE status = 'active' AND start_time <= NOW() AND end_time > NOW()
       ORDER BY id ASC`
    );

    const now = new Date();
    const imageAds = allActive.filter(a => a.media_type === 'image');
    const gifAds = allActive.filter(a => a.media_type === 'gif');
    const videoAds = allActive.filter(a => a.media_type === 'video');

    const formatDecision = (decision) => ({
      ...decision,
      nextSwitchAt: decision.nextSwitchAt ? formatIST(decision.nextSwitchAt) : null
    });

    res.json({
      image: formatDecision(decideCurrentAd(imageAds, now)),
      gif: formatDecision(decideCurrentAd(gifAds, now)),
      video: formatDecision(decideCurrentAd(videoAds, now)),
      rotationIntervalMinutes: ROTATION_INTERVAL_MINUTES,
      serverTime: formatIST(now)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCurrentSchedule, getZonedSchedule };