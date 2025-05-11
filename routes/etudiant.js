const express = require('express');
const router = express.Router();
// const { auth } = require('../middlewares/authentification'); // <= Importer ici
const examController = require('../controllers/enseignant');
const ExamResult = require('../models/examResult');
const User = require('../models/user');

// Appliquer le middleware à toutes les routes étudiant (sauf exceptions)
router.get('/profile',async (req, res) => { // <= ajout de auth
  try {
    res.render('etudiant/profile', {
      user: req.user
    });
  } catch (error) {
    console.error('Erreur profil étudiant:', error);
    res.status(500).render('principale/error', {
      message: 'Erreur lors du chargement du profil.'
    });
  }
});

router.get("/", (req, res) => { // <= ajout de auth
  res.render("etudiant/etudiant");
});

router.post('/submit-exam',async (req, res) => { // <= ajout de auth
  try {
    const { user, score, geolocation } = req.body;
    const foundUser = await User.findById(user);
    if (!foundUser) {
      return res.status(400).send('User not found');
    }

    const newExamResult = new ExamResult({
      user,
      score,
      geolocation
    });

    await newExamResult.save();
    res.send('Exam result submitted successfully!');
  } catch (error) {
    console.error('Error saving exam result:', error);
    res.status(500).send('Error saving exam result.');
  }
});

module.exports = router;