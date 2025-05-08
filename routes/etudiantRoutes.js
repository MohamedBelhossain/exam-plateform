const express = require('express');
const router = express.Router();
const etudiantController = require('../controllers/etudiantController');
router.get('/', (req, res) => {
    res.render('etudiant/projet', { title: 'Espace Étudiant' });
});
router.get('/questions', etudiantController.getQuestions);
router.post('/location', etudiantController.saveLocation);
router.post('/score', etudiantController.saveScore);
module.exports = router;