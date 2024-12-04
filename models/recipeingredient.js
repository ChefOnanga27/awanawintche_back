const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeIngredient = sequelize.define('RecipeIngredient', {
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = RecipeIngredient;