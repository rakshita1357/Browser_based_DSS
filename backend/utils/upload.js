const multer = require('multer');
const path = require('path');

const typeFolders = {
  'image/jpeg': 'images',
  'image/png': 'images',
  'image/webp': 'images',
  'image/gif': 'gifs',
  'video/mp4': 'videos'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = typeFolders[file.mimetype];
    if (!folder) return cb(new Error('Unsupported file type'));
    cb(null, path.join(__dirname, '..', '..', 'media', folder));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (typeFolders[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type: ' + file.mimetype), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max

module.exports = upload;