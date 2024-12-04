const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import des modèles
const User = require('./users');
const Recipe = require('./recipe');
const Ingredient = require('./ingredient');
const Category = require('./category');
const Comment = require('./comment');
const RecipeIngredient = require('./recipeIngredient');
const RecipeCategory = require('./recipeCategory');

// Définition des relations
User.hasMany(Recipe, { foreignKey: 'user_id' });
Recipe.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

Recipe.hasMany(Comment, { foreignKey: 'recipe_id' });
Comment.belongsTo(Recipe, { foreignKey: 'recipe_id' });

Recipe.belongsToMany(Ingredient, { through: RecipeIngredient });
Ingredient.belongsToMany(Recipe, { through: RecipeIngredient });

Recipe.belongsToMany(Category, { through: RecipeCategory });
Category.belongsToMany(Recipe, { through: RecipeCategory });

module.exports = {
  sequelize,
  User,
  Recipe,
  Ingredient,
  Category,
  Comment,
  RecipeIngredient,
  RecipeCategory
};