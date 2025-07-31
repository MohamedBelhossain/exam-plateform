const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { auth } = require('../middlewares/authentification');  // Import the auth function
const userController = require('../controllers/userController');

// Change from authMiddleware to auth
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({});
    // Remove password from each user
    const sanitizedUsers = users.map(user => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });
    res.status(200).json(sanitizedUsers);
  } catch (e) {
    console.error('Error fetching users:', e);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// routes/user.js




// Public routes (no authentication required)
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

//
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('Email reçu pour reset:', email);

  // Si l'email est vide
  if (!email) return res.status(400).json({ message: 'Email manquant.' });

  // Vérifie que l'utilisateur existe
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

  // Génère un token, envoie l’email (tu peux logguer à la place d’envoyer)
  const token = crypto.randomBytes(20).toString('hex');
  user.resetToken = token;
  user.resetTokenExpire = Date.now() + 3600000; // 1h
  await user.save();

  console.log(`Lien à envoyer : http://localhost:3000/reset-password/${token}`);

  res.json({ message: 'Email envoyé (simulé)' });
});

router.get('/reset-password/:token', async (req, res) => {
  const token = req.params.token;

  // Tu peux ici vérifier le token dans la base de données si tu veux

  res.render('principale/reset-password', { token });
});
router.post('/reset-password/:token', async (req, res) => {
  const { password, confirmPassword } = req.body;
  const token = req.params.token;

  if (password !== confirmPassword) {
    return res.send('Les mots de passe ne correspondent pas.');
  }

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  });

  if (!user) {
    return res.send('Lien invalide ou expiré.');
  }

  user.password = password; // Pense à hasher si tu utilises bcrypt
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  res.send('Mot de passe modifié avec succès.');
});


module.exports = router;