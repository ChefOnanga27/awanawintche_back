const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Synchronisation de la base de données et démarrage du serveur
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.sync({ alter: true }); // En développement, utilisez { force: true } pour recréer les tables
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();