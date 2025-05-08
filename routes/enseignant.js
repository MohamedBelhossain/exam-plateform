const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Exam = require('../models/examen');
const Question = require('../models/question');
const enseignantController = require('../controllers/enseignant');

// Define the storage and file filter for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Save the file in 'public/uploads'
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Give the file a unique name
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image', 'audio', 'video'];
    const mimeType = file.mimetype.split('/')[0];
    if (allowedTypes.includes(mimeType)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Fichier non supporté'), false); // Reject the file
    }
};

const upload = multer({ storage, fileFilter });

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

// Traitement de l'ajout des questions (POST) avec l'upload
router.post('/examens/:uuid/add-questions', upload.single('media'), async (req, res) => {
    try {
        const mediaPath = req.file ? '/uploads/' + req.file.filename : null; // Check if a file was uploaded

        const newQuestion = {
            enonce: req.body.enonce,
            type: req.body.type,
            choix: req.body.choix,
            bonneReponse: req.body.bonneReponse,
            points: req.body.points,
            media: mediaPath, // Store the media path in the database
        };

        // Create and save the new question
        const question = new Question(newQuestion);
        await question.save();

        // Add the new question to the exam
        const exam = await Exam.findOne({ uuid: req.params.uuid });
        exam.questions.push(question);
        await exam.save();

        // Redirect to the add questions page of the exam
        res.redirect(`/enseignant/examens/${req.params.uuid}/add-questions`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de l\'ajout de la question');
    }
});

module.exports = router;
