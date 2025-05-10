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
        
        // Trouver l'examen et populer les questions
        const exam = await Exam.findOne({ uuid }).populate('questions');
        
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

// Route to add questions to an exam
const addQuestionsToExam = async (req, res) => {
    try {
        const uuid = req.params.uuid;

        const exam = await Exam.findOne({ uuid: uuid });

        if (!exam) {
            return res.status(404).send("Examen non trouvé");
        }

        upload.single('media')(req, res, async (err) => {
            if (err) {
                console.error("Erreur d'upload:", err);
                return res.status(500).send(`Erreur lors de l'upload du fichier: ${err.message}`);
            }

            const mediaPath = req.file ? '/uploads/' + req.file.filename : null;
            const {
                enonce,
                type,
                choix,
                bonneReponse,
                bonneReponseDirecte,
                tolerance,
                points,
                duree
            } = req.body;
            
            console.log("Données reçues:", {
                enonce,
                type,
                choix: Array.isArray(choix) ? choix : [choix],
                bonneReponse: bonneReponse || bonneReponseDirecte,
                tolerance,
                points,
                duree
            });

            let newQuestion;

            if (type === 'qcm') {
                // S'assurer que choix est un tableau
                const choixArray = Array.isArray(choix) ? choix : [choix];
                
                newQuestion = new Question({
                    enonce,
                    type,
                    choix: choixArray.filter(c => c && c.trim() !== ""),
                    bonneReponse: [bonneReponse], 
                    points: Number(points),
                    duree: Number(duree),
                    media: mediaPath
                });
            } else if (type === 'directe') {
                newQuestion = new Question({
                    enonce,
                    type,
                    bonneReponse: [bonneReponseDirecte], 
                    tolerance: Number(tolerance),
                    points: Number(points),
                    duree: Number(duree),
                    media: mediaPath
                });
            } else {
                return res.status(400).send("Type de question non reconnu.");
            }
            
            console.log("Question à sauvegarder:", newQuestion);

            try {
                await newQuestion.save();
                exam.questions.push(newQuestion);
                await exam.save();
                
                console.log("Question sauvegardée avec succès");
                return res.redirect(`/enseignant/examens/${uuid}/add-questions`);
            } catch (saveError) {
                console.error("Erreur lors de la sauvegarde:", saveError);
                return res.status(500).send(`Erreur lors de la sauvegarde: ${saveError.message}`);
            }
        });

    } catch (error) {
        console.error("Erreur dans addQuestionsToExam:", error);
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
const deleteQuestion = async (req, res) => {
    try {
        const { uuid, questionId } = req.params;
        console.log(`Suppression de la question: ${questionId} de l'examen: ${uuid}`);
        
        // Vérifier si l'examen existe
        const exam = await Exam.findOne({ uuid });
        if (!exam) {
            return res.status(404).send("Examen non trouvé");
        }

        // Supprimer la question de la base de données
        const deleteResult = await Question.findByIdAndDelete(questionId);
        if (!deleteResult) {
            console.log(`Question ${questionId} non trouvée dans la base de données`);
            return res.status(404).send("Question non trouvée");
        }
        console.log(`Question ${questionId} supprimée de la base de données`);

        // Retirer la question de l'examen en filtrant les ID
        exam.questions = exam.questions.filter(qId => qId.toString() !== questionId);
        
        // Attendre que la sauvegarde soit terminée avant de rediriger
        await exam.save();
        console.log(`Question ${questionId} retirée de l'examen ${uuid}`);

        // Rediriger immédiatement
        res.redirect(`/enseignant/examens/${uuid}/add-questions`);
        
    } catch (error) {
        console.error("Erreur dans deleteQuestion:", error);
        res.status(500).send(`Erreur serveur: ${error.message}`);
    }
};
const updateQuestion = async (req, res) => {
    try {
        const { uuid, questionId } = req.params;
        console.log(`Mise à jour de la question: ${questionId} pour l'examen: ${uuid}`);
        
        const exam = await Exam.findOne({ uuid });
        if (!exam) {
            return res.status(404).send("Examen non trouvé");
        }

        // Utilisons un middleware multer séparé pour ce point de terminaison
        const uploadMiddleware = upload.single('media');
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                console.error("Erreur d'upload:", err);
                return res.status(500).send(`Erreur lors de l'upload du fichier: ${err.message}`);
            }

            try {
                const question = await Question.findById(questionId);
                if (!question) {
                    return res.status(404).send("Question non trouvée");
                }

                // Récupérer les données de la requête
                const mediaPath = req.file ? '/uploads/' + req.file.filename : question.media;
                const {
                    enonce,
                    type,
                    choix,
                    bonneReponse,
                    bonneReponseDirecte,
                    tolerance,
                    points,
                    duree
                } = req.body;

                // Mise à jour de la question
                if (type === 'qcm') {
                    // S'assurer que choix est un tableau
                    const choixArray = Array.isArray(choix) ? choix : [choix];
                    
                    question.enonce = enonce;
                    question.type = type;
                    question.choix = choixArray.filter(c => c && c.trim() !== "");
                    question.bonneReponse = [bonneReponse];
                    question.points = Number(points);
                    question.duree = Number(duree);
                    question.media = mediaPath;
                } else if (type === 'directe') {
                    question.enonce = enonce;
                    question.type = type;
                    question.bonneReponse = [bonneReponseDirecte];
                    question.tolerance = Number(tolerance);
                    question.points = Number(points);
                    question.duree = Number(duree);
                    question.media = mediaPath;
                }

                await question.save();
                return res.redirect(`/enseignant/examens/${uuid}/add-questions`);
            } catch (updateError) {
                console.error("Erreur lors de la mise à jour:", updateError);
                return res.status(500).send(`Erreur lors de la mise à jour: ${updateError.message}`);
            }
        });
    } catch (error) {
        console.error("Erreur dans updateQuestion:", error);
        res.status(500).send(`Erreur serveur: ${error.message}`);
    }
};
// Obtenir tous les examens
const getExamByUUID = async (req, res) => {
    try {
        const { uuid } = req.params;
        const exam = await Exam.findOne({ uuid }).populate('questions');
        
        if (!exam) {
            return res.status(404).send("Examen non trouvé");
        }
        
        // URL relatif pour la cohérence
        const lienComplet = `/enseignant/examens/${uuid}/add-questions`;
        
        res.render('exam-espace', {
            exam: exam.toJSON(),
            lienComplet
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'examen :", error);
        res.status(500).send("Erreur serveur");
    }
};

// MODIFY the getAllExams function to:
const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate('questions');
        
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
    getAllExams,
    updateQuestion,
    deleteQuestion
};