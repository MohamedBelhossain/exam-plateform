 branche-itlouhen-mohamed
// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { sendVerificationEmail } = require('../utils/emailSender');
const bcrypt = require('bcrypt'); // Ajout nécessaire pour bcrypt


// Enregistrement d'un nouvel utilisateur
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = new User({ email, password });
    user.generateVerificationToken();
    
    await user.save();
    await sendVerificationEmail(email, user.verificationToken);
    
    res.redirect('/verification-email');
  } catch (error) {
    res.status(400).render('inscrire', { error: 'L\'email est déjà utilisé' });
  }
});

// Activation du compte
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    
    if (!user) {
      return res.status(404).render('error', { message: 'Lien invalide' });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.redirect('/connexion');
  } catch (error) {
    res.status(500).render('error', { message: 'Erreur lors de l\'activation' });
  }
});

// Connexion utilisateur
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).render('connexion', { error: 'Identifiants incorrects' });
    }
    
    if (!user.isVerified) {
      return res.render('connexion', { error: 'Veuillez activer votre compte d\'abord' });
    }
    
    // Création de la session
    req.session.userId = user._id;
    res.redirect('/main');
  } catch (error) {
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// routes/auth.js

// Après une connexion réussie
req.session.userId = user._id;
req.session.role = user.role;

// Middleware de vérification
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).redirect('/connexion');
  }
  next();
};

// Route protégée
app.get('/profile', requireAuth, (req, res) => {
  res.render('profile', { user: req.session.user });
});

// Après une connexion réussie
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000, // 1 jour
  sameSite: 'strict',
  path: '/'
});

// Déconnexion
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.clearCookie('connect.sid'); // Cookie de session
  res.redirect('/');
});