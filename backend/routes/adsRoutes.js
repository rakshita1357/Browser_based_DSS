const express = require('express');
const router = express.Router();
const controller = require('../controllers/adsController');
const upload = require('../utils/upload');
// IMPORTANT: specific routes before /:id, or Express will treat "active"/"upcoming" as an id
router.get('/active', controller.getActiveAds);
router.get('/upcoming', controller.getUpcomingAds);
router.get('/', controller.getAllAds);
router.get('/:id', controller.getAdById);
router.post('/', controller.createAd);
router.put('/:id', controller.updateAd);
router.delete('/:id', controller.deleteAd);
router.post('/upload', upload.single('file'), controller.uploadMedia);
router.post('/demo-seed', controller.generateDemoAds);
module.exports = router;