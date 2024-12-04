const express = require('express');
const { Op } = require('sequelize');
const { User, Recipe, Comment } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Statistiques globales (admin seulement)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const now = new Date();
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

    const stats = {
      users: {
        total: await User.count(),
        active: await User.count({ where: { is_active: true } }),
        new: await User.count({
          where: {
            createdAt: {
              [Op.gte]: lastMonth
            }
          }
        })
      },
      recipes: {
        total: await Recipe.count(),
        new: await Recipe.count({
          where: {
            createdAt: {
              [Op.gte]: lastMonth
            }
          }
        })
      },
      comments: {
        total: await Comment.count(),
        new: await Comment.count({
          where: {
            createdAt: {
              [Op.gte]: lastMonth
            }
          }
        })
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistiques personnelles
router.get('/personal', auth, async (req, res) => {
  try {
    const stats = {
      recipes: await Recipe.count({ where: { user_id: req.user.id } }),
      comments: await Comment.count({ where: { user_id: req.user.id } }),
      // Ajoutez d'autres statistiques personnelles selon vos besoins
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;