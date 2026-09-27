const pool = require('../db/pool');

// GET /api/ads
async function getAllAds(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM ads ORDER BY start_time ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/ads/active
async function getActiveAds(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM ads
       WHERE status = 'active'
       AND start_time <= NOW()
       AND end_time > NOW()
       ORDER BY priority DESC, start_time ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/ads/upcoming
async function getUpcomingAds(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM ads
       WHERE status = 'active'
       AND start_time > NOW()
       ORDER BY start_time ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/ads/:id
async function getAdById(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM ads WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ad not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/ads
async function createAd(req, res) {
  try {
    const { name, media_type, media_url, start_time, end_time, status, priority } = req.body;

    if (!name || !media_type || !media_url || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields: name, media_type, media_url, start_time, end_time' });
    }
    if (!['image', 'gif', 'video'].includes(media_type)) {
      return res.status(400).json({ error: 'media_type must be image, gif, or video' });
    }
    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ error: 'end_time must be after start_time' });
    }

    const [result] = await pool.query(
      `INSERT INTO ads (name, media_type, media_url, start_time, end_time, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, media_type, media_url, start_time, end_time, status || 'active', priority || 0]
    );

    res.status(201).json({ id: result.insertId, message: 'Ad created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/ads/:id
async function updateAd(req, res) {
  try {
    const { name, media_type, media_url, start_time, end_time, status, priority } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM ads WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Ad not found' });

    if (media_type && !['image', 'gif', 'video'].includes(media_type)) {
      return res.status(400).json({ error: 'media_type must be image, gif, or video' });
    }

    const current = existing[0];
    const newStart = start_time || current.start_time;
    const newEnd = end_time || current.end_time;
    if (new Date(newEnd) <= new Date(newStart)) {
      return res.status(400).json({ error: 'end_time must be after start_time' });
    }

    await pool.query(
      `UPDATE ads SET name = ?, media_type = ?, media_url = ?, start_time = ?, end_time = ?, status = ?, priority = ?
       WHERE id = ?`,
      [
        name || current.name,
        media_type || current.media_type,
        media_url || current.media_url,
        newStart,
        newEnd,
        status || current.status,
        priority !== undefined ? priority : current.priority,
        id
      ]
    );

    res.json({ message: 'Ad updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/ads/:id
async function deleteAd(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM ads WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ad not found' });
    res.json({ message: 'Ad deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// POST /api/ads/upload
function uploadMedia(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const typeMap = { images: 'image', gifs: 'gif', videos: 'video' };
  const folder = req.file.destination.split(require('path').sep).pop();
  const mediaType = typeMap[folder];
  const mediaUrl = `/media/${folder}/${req.file.filename}`;

  res.status(201).json({ media_url: mediaUrl, media_type: mediaType });
}
// POST /api/ads/demo-seed
async function generateDemoAds(req, res) {
  if (process.env.DEMO_MODE !== 'true') {
    return res.status(403).json({ error: 'Demo mode is disabled. Set DEMO_MODE=true in .env' });
  }

  try {
    const [existingImages] = await pool.query(
      `SELECT media_url FROM ads WHERE media_type = 'image' LIMIT 1`
    );
    const fallbackImage = existingImages[0]?.media_url || '/media/images/ad1.jpg';

    await pool.query(
      `INSERT INTO ads (name, media_type, media_url, start_time, end_time, status, priority) VALUES
       (?, 'image', ?, DATE_ADD(NOW(), INTERVAL 1 MINUTE), DATE_ADD(NOW(), INTERVAL 8 MINUTE), 'active', 0),
       (?, 'image', ?, DATE_ADD(NOW(), INTERVAL 4 MINUTE), DATE_ADD(NOW(), INTERVAL 12 MINUTE), 'active', 0)`,
      [`Demo ${Date.now()} - A`, fallbackImage, `Demo ${Date.now()} - B`, fallbackImage]
    );

    res.status(201).json({ message: 'Demo ads created — active in ~1 minute, overlap in ~4 minutes' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
module.exports = {
  getAllAds, getActiveAds, getUpcomingAds, getAdById, createAd, updateAd, deleteAd, uploadMedia, generateDemoAds
};