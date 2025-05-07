const express = require('express');
const router = express.Router();
const examController = require('../controllers/enseignant');

router.get("/", (req, res) => {
    res.render("enseignant/enseignant");
});
router.post('/create-exams', examController.createExam);
router.get('/examens', examController.getAllExams);

module.exports = router;

