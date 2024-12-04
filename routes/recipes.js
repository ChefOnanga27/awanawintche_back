const express = require('express');
const { Recipe, User, Ingredient, Category, Comment, RecipeIngredient, RecipeCategory } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Récupérer toutes les recettes avec pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const recipes = await Recipe.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Category,
          through: { attributes: [] }
        },
        {
          model: Ingredient,
          through: { attributes: ['quantity', 'unit'] }
        }
      ],
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

// Créer une nouvelle recette
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, duration, difficulty, ingredients, categories, ...recipeData } = req.body;
    
    const recipe = await Recipe.create({
      ...recipeData,
      user_id: req.user.id
    });

    // Ajouter les ingrédients
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        const [ingredient] = await Ingredient.findOrCreate({
          where: { name: ing.name }
        });
        await RecipeIngredient.create({
          recipe_id: recipe.id,
          ingredient_id: ingredient.id,
          quantity: ing.quantity,
          unit: ing.unit
        });
      }
    }

    // Ajouter les catégories
    if (categories && categories.length > 0) {
      for (const cat of categories) {
        const [category] = await Category.findOrCreate({
          where: { name: cat }
        });
        await RecipeCategory.create({
          recipe_id: recipe.id,
          category_id: category.id
        });
      }
    }

    const recipeWithRelations = await Recipe.findByPk(recipe.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Category,
          through: { attributes: [] }
        },
        {
          model: Ingredient,
          through: { attributes: ['quantity', 'unit'] }
        }
      ]
    });

    res.status(201).json(recipeWithRelations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Récupérer une recette spécifique
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Category,
          through: { attributes: [] }
        },
        {
          model: Ingredient,
          through: { attributes: ['quantity', 'unit'] }
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'avatar']
            }
          ]
        }
      ]
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une recette
router.put('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    if (recipe.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const { ingredients, categories, ...recipeData } = req.body;

    // Mise à jour des données de base
    await recipe.update(recipeData);

    // Mise à jour des ingrédients
    if (ingredients) {
      await RecipeIngredient.destroy({ where: { recipe_id: recipe.id } });
      
      for (const ing of ingredients) {
        const [ingredient] = await Ingredient.findOrCreate({
          where: { name: ing.name }
        });
        await RecipeIngredient.create({
          recipe_id: recipe.id,
          ingredient_id: ingredient.id,
          quantity: ing.quantity,
          unit: ing.unit
        });
      }
    }

    // Mise à jour des catégories
    if (categories) {
      await RecipeCategory.destroy({ where: { recipe_id: recipe.id } });
      
      for (const cat of categories) {
        const [category] = await Category.findOrCreate({
          where: { name: cat }
        });
        await RecipeCategory.create({
          recipe_id: recipe.id,
          category_id: category.id
        });
      }
    }

    const updatedRecipe = await Recipe.findByPk(recipe.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Category,
          through: { attributes: [] }
        },
        {
          model: Ingredient,
          through: { attributes: ['quantity', 'unit'] }
        }
      ]
    });

    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une recette
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    if (recipe.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await recipe.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un commentaire à une recette
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    const comment = await Comment.create({
      content: req.body.content,
      user_id: req.user.id,
      recipe_id: recipe.id
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;