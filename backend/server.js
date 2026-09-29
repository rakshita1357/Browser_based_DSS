require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const adsRoutes = require('./routes/adsRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/media', express.static(require('path').join(__dirname, '..', 'media')));
app.use(express.static(require('path').join(__dirname, '..', 'frontend')));
app.use('/api/ads', adsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});