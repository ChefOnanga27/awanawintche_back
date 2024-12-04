const express = require('express');
const authRoutes = require('./auth');
const recipeRoutes = require('./recipes');
const categoryRoutes = require('./categories');
const uploadRoutes = require('./upload');
const searchRoutes = require('./search');
const statsRoutes = require('./stats');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);
router.use('/stats', statsRoutes);

module.exports = router;