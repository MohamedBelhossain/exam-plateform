const express = require('express');
const router = express.Router();
// const { auth } = require('../middlewares/authentification'); // Importer ici
const enseignantController = require('../controllers/enseignant');

// Appliquer le middleware à toutes les routes enseignant (sauf exceptions)
router.get('/profile', async (req, res) => { // Ajout de auth
  try {
    res.render('enseignant/profile', {
      user: req.user
    });
  } catch (error) {
    console.error('Erreur profil enseignant:', error);
    res.status(500).render('principale/error', {
      message: 'Erreur lors du chargement du profil.'
    });
  }
});

router.get("/",  (req, res) => { // Ajout de auth
  res.render("enseignant/enseignant");
});

router.get('/parametres',  (req, res) => { // Ajout de auth
  res.render('enseignant/parametres');
});

// Route pour accéder aux détails de l'examen par UUID
router.get('/examen/:uuid',  enseignantController.getExamByUUID);

// Route pour créer un examen
router.post('/create-exams',  enseignantController.createExam);

// Route pour obtenir tous les examens
router.get('/examens',  enseignantController.getAllExams);

// Page pour ajouter des questions
router.get('/examens/:uuid/add-questions',  enseignantController.renderAddQuestionsPage);

// Route POST pour ajouter une question
router.post('/examens/:uuid/add-questions',  enseignantController.addQuestionsToExam);

// Modifier une question
router.post('/examens/:uuid/update-question/:questionId', enseignantController.updateQuestion);

// Supprimer une question
router.delete('/examens/:uuid/delete-question/:questionId',  enseignantController.deleteQuestion);
router.post('/examens/:uuid/delete-question/:questionId', enseignantController.deleteQuestion);

module.exports = router;
