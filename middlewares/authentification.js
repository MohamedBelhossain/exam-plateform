// middlewares/authentification.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const cookieParser = require('cookie-parser'); // Ajouté

// Middleware d'authentification JWT
const auth = async (req, res, next) => {
  try {
    // Récupération du token depuis :
    // - Cookie 'jwt'
    // - Ou header Authorization: Bearer <token>
    const token = req.cookies.jwt || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).send({ error: 'Token requis' });
    }

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Recherche de l'utilisateur correspondant
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(401).send({ error: 'Utilisateur non trouvé' });
    }

    // Ajouter des informations à la requête
    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error.message);
    res.status(401).send({ error: 'Veuillez vous authentifier' });
  }
};

// Middleware pour rediriger les utilisateurs déjà authentifiés
const redirectIfAuthenticated = (req, res, next) => {
  // Vérifie si l'utilisateur est déjà connecté via session ou cookie
  if (req.session && req.session.user) {
    return res.redirect('/main'); // Rediriger vers le tableau de bord
  }
  next();
};

module.exports = { auth, redirectIfAuthenticated };