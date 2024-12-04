const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.checkPassword(password))) {
      throw new Error('Identifiants invalides');
    }

    user.last_login = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Profil utilisateur
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// Mise à jour du profil
router.patch('/profile', auth, async (req, res) => {
  try {
    Object.assign(req.user, req.body);
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Statistiques des utilisateurs (pour les admins)
router.get('/stats', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const stats = {
      totalUsers: await User.count(),
      activeUsers: await User.count({ where: { is_active: true } }),
      newUsers: await User.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(new Date() - 24*60*60*1000)
          }
        }
      }),
      // Ajoutez d'autres statistiques selon vos besoins
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;