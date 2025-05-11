// routes/principale.js
const express = require('express');
const router = express.Router();
const { redirectIfAuthenticated } = require('../middlewares/authentification');

// Route pour la page d'accueil
router.get('/', (req, res) => {
  res.redirect('/principale/accueil');
});

// Route pour la page d'accueil
router.get('/accueil', (req, res) => {
  res.render('principale/accueil');
});
// Étudiant
router.get('/inscrire-etudiant', redirectIfAuthenticated, (req, res) => {
  res.render('principale/inscrire-etudiant', { error: null });
});

// Enseignant
router.get('/inscrire-enseignant', redirectIfAuthenticated, (req, res) => {
  res.render('principale/inscrire-enseignant', { error: null });
});

// Route pour la page de connexion
router.get('/connexion', redirectIfAuthenticated, (req, res) => {
  res.render('principale/connexion', { error: null, success: null });
});

// Route pour la page d'inscription
router.get('/inscrire', redirectIfAuthenticated, (req, res) => {
  res.render('principale/inscrire', { error: null, formData: {} });
});

// Route pour la page "mot de passe oublié"
router.get('/forgot', redirectIfAuthenticated, (req, res) => {
  res.render('principale/forgot', { error: null, message: null });
});

// Route pour la page d'erreur
router.get('/error', (req, res) => {
  res.render('principale/error', { message: 'Une erreur est survenue.' });
});

module.exports = router;