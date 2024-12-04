const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('Facile', 'Moyen', 'Difficile'),
    defaultValue: 'Moyen'
  },
  image: {
    type: DataTypes.STRING
  },
  video: {
    type: DataTypes.STRING
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Recipe;