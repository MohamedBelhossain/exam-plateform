// Fichier controllers/enseignant.js
const Exam = require('../models/examen');
const { v4: uuidv4 } = require('uuid');

// Fonction pour créer un nouvel examen
const createExam = async (req, res) => {
    try {
        const { titre, description, publicCible } = req.body;
        
        if (!titre || !description || !publicCible) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }
        
        // Générer un UUID unique
        const uuid = uuidv4();
        
        const examen = new Exam({
            titre,
            description,
            public: publicCible,
            uuid
        });
        
        await examen.save();
        
        // Construire le lien d'accès complet pour la réponse
        const lienComplet = `${req.protocol}://${req.get('host')}/examen/${uuid}`;
        
        res.status(201).json({ 
            message: 'Examen créé avec succès', 
            examen: examen.toJSON(),
            lienAcces: lienComplet 
        });
    } catch (error) {
        console.error("Error saving exam:", error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'examen', error: error.message });
    }
};

// Fonction pour trouver l'examen par UUID
const getExamByUUID = async (req, res) => {
    try {
        const { uuid } = req.params;
        
        // Rechercher directement par UUID et non par lien complet
        const exam = await Exam.findOne({ uuid });
        
        if (!exam) {
            return res.status(404).send('Examen non trouvé');
        }
        
        // Construire le lien complet pour l'affichage si nécessaire
        const lienComplet = `${req.protocol}://${req.get('host')}/examen/${uuid}`;
        
        res.render('examDetail', { 
            exam: exam.toJSON(),
            lienComplet
        });
    } catch (error) {
        console.error("Error fetching exam:", error);
        res.status(500).send('Erreur lors de la récupération de l\'examen');
    }
};

// Contrôleur pour obtenir tous les examens
const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find();
        
        // Ajouter les liens complets pour chaque examen
        const examsWithFullLinks = exams.map(exam => {
            const examObj = exam.toJSON();
            examObj.lienComplet = `${req.protocol}://${req.get('host')}/examen/${exam.uuid}`;
            return examObj;
        });
        
        res.json(examsWithFullLinks);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des examens', error: error.message });
    }
};

module.exports = {
    createExam,
    getExamByUUID,
    getAllExams
};