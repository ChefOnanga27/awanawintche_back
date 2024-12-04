const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeCategory = sequelize.define('RecipeCategory', {}, {
  timestamps: false
});

module.exports = RecipeCategory;