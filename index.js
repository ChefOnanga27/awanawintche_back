const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/database');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis le dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', routes);

// Route par défaut pour gérer le SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Une erreur est survenue sur le serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Synchronisation de la base de données et démarrage du serveur
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // Synchroniser la base de données
        await sequelize.sync({ alter: true });
        console.log('Base de données synchronisée avec succès');

        // Démarrer le serveur
        app.listen(PORT, () => {
            console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
        });
    } catch (error) {
        console.error('Impossible de démarrer le serveur:', error);
        process.exit(1);
    }
}

// Démarrer le serveur
startServer();

// Gestion de l'arrêt propre du serveur
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu. Arrêt gracieux du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT reçu. Arrêt gracieux du serveur...');
    process.exit(0);
});