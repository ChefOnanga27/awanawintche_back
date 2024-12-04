const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Upload d'une image
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }
    res.json({
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;