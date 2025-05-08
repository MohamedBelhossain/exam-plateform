const Exam = require('../models/examen');
const Question = require('../models/question');
const { v4: uuidv4 } = require('uuid');

// Fonction pour créer un nouvel examen
const createExam = async (req, res) => {
    try {
        const { titre, description, publicCible } = req.body;
        
        if (!titre || !description || !publicCible) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }
        
        const uuid = uuidv4();
        
        const examen = new Exam({
            titre,
            description,
            public: publicCible,
            uuid,
            questions: []
        });
        
        await examen.save();
        
        
        const lienExamen = `/enseignant/examens/${uuid}/add-questions`;
        
        res.status(201).json({
            message: 'Examen créé avec succès',
            examen: examen.toJSON(),
            lienAcces: lienExamen
        });
            
    } catch (error) {
        console.error("Erreur lors de la création de l'examen :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Afficher la page pour ajouter des questions
const renderAddQuestionsPage = async (req, res) => {
    try {
        const { uuid } = req.params;
        console.log(`Tentative d'accès à l'examen avec UUID: ${uuid}`); 
        
        const exam = await Exam.findOne({ uuid });
        
        if (!exam) {
            console.log(`Examen avec UUID ${uuid} non trouvé`); 
            return res.status(404).send("Examen non trouvé");
        }
        
        console.log(`Examen trouvé, rendu de la page add-questions`); 
        res.render('enseignant/add-questions', { exam: exam, questions: exam.questions });
    } catch (error) {
        console.error("Erreur dans renderAddQuestionsPage:", error);
        res.status(500).send(`Erreur serveur: ${error.message}`);
    }
};


// Ajouter des questions à un examen
const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image', 'audio', 'video'];
    const mimeType = file.mimetype.split('/')[0];
    if (allowedTypes.includes(mimeType)) {
        cb(null, true);
    } else {
        cb(new Error('Fichier non supporté'), false); // Reject unsupported file types
    }
};

const upload = multer({ storage, fileFilter });

// Route to add questions to an exam
const addQuestionsToExam = async (req, res) => {
    try {
        const { uuid } = req.params;
        const exam = await Exam.findOne({ uuid });

        if (!exam) {
            return res.status(404).send("Examen non trouvé");
        }

        upload.single('media')(req, res, async (err) => {
            if (err) {
                return res.status(500).send(`Erreur lors de l'upload du fichier: ${err.message}`);
            }

            const mediaPath = req.file ? '/uploads/' + req.file.filename : null;
            const {
                enonce,
                type,
                choix,
                bonneReponse,
                bonneReponseDirecte,
                tolerance
            } = req.body;

            let newQuestion;

            if (type === 'qcm') {
                newQuestion = new Question({
                    enonce,
                    type,
                    choix: choix.filter(c => c.trim() !== ""),
                    bonneReponse,
                    media: mediaPath
                });
            } else if (type === 'directe') {
                newQuestion = new Question({
                    enonce,
                    type,
                    bonneReponse: [bonneReponseDirecte], // Changed from 'reponse' to 'bonneReponseDirecte'
                    tolerance: Number(tolerance),
                    media: mediaPath
                });
            } else {
                return res.status(400).send("Type de question non reconnu.");
            }

            await newQuestion.save();
            exam.questions.push(newQuestion);
            await exam.save();

            res.redirect(`/enseignant/examens/${uuid}/add-questions`);
        });

    } catch (error) {
        console.error("Erreur dans addQuestionsToExam:", error);
        res.status(500).send(`Erreur serveur: ${error.message}`);
    }
};
// Obtenir un examen via UUID
const getExamByUUID = async (req, res) => {
    try {
        const { uuid } = req.params;
        const exam = await Exam.findOne({ uuid });
        
        if (!exam) {
            return res.status(404).send("Examen non trouvé");
        }
        
        // URL relatif pour la cohérence
        const lienComplet = `/enseignant/examens/${uuid}/add-questions`;
        
        res.render('examDetail', {
            exam: exam.toJSON(),
            lienComplet
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'examen :", error);
        res.status(500).send("Erreur serveur");
    }
};

// Obtenir tous les examens
const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find();
        
        const examsWithLinks = exams.map(exam => {
            const examObj = exam.toJSON();
            // URL relatif, pas d'hôte ni de protocole
            examObj.lienComplet = `/enseignant/examens/${exam.uuid}/add-questions`;
            return examObj;
        });
        
        res.json(examsWithLinks);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des examens', error: error.message });
    }
};

module.exports = {
    createExam,
    renderAddQuestionsPage,
    addQuestionsToExam,
    getExamByUUID,
    getAllExams
};