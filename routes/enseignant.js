const express = require('express');
const router = express.Router();
const enseignantController = require('../controllers/enseignant');

// Route principale
router.get("/", (req, res) => {
    res.render("enseignant/enseignant");
});

router.get('/parametres', (req, res) => {
    res.render('enseignant/parametres');
});

router.get('/profile', (req, res) => {
    res.render('enseignant/profile');
});

// Route pour accéder aux détails de l'examen par UUID
router.get('/examen/:uuid', enseignantController.getExamByUUID);

// Route pour créer un examen
router.post('/create-exams', enseignantController.createExam);

// Route pour obtenir tous les examens
router.get('/examens', enseignantController.getAllExams);

// Page pour ajouter des questions
router.get('/examens/:uuid/add-questions', enseignantController.renderAddQuestionsPage);

// ✅ Route POST pour ajouter une question (déléguée au contrôleur)
router.post('/examens/:uuid/add-questions', enseignantController.addQuestionsToExam);
// Modifier une question

router.post('/examens/:uuid/update-question/:questionId',enseignantController.updateQuestion);


// Supprimer une question
router.delete('/examens/:uuid/delete-question/:questionId',enseignantController.deleteQuestion);
router.post('/examens/:uuid/delete-question/:questionId',enseignantController.deleteQuestion);


module.exports = router;

