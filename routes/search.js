const express = require('express');
const { Op } = require('sequelize');
const { Recipe, Category, Ingredient } = require('../models');
const router = express.Router();

// Recherche de recettes
router.get('/recipes', async (req, res) => {
  try {
    const { q, category, difficulty, duration } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    const include = [
      {
        model: Category,
        through: { attributes: [] }
      },
      {
        model: Ingredient,
        through: { attributes: ['quantity', 'unit'] }
      }
    ];

    // Recherche par mot-clé
    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ];
    }

    // Filtre par catégorie
    if (category) {
      include[0].where = { name: category };
    }

    // Filtre par difficulté
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Filtre par durée
    if (duration) {
      where.duration = { [Op.lte]: duration };
    }

    const recipes = await Recipe.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      recipes: recipes.rows,
      total: recipes.count,
      totalPages: Math.ceil(recipes.count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;