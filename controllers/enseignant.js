
const Exam = require('../models/examen');
// const { v4: uuidv4 } = require('uuid');
const createExam = async (req, res) => {
    try {
        const { titre, description, publicCible } = req.body;

        if (!titre || !description || !publicCible) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        const examen = new Exam({
            titre,
            description,
            public: publicCible
            // lienAcces
        });

        await examen.save();

        res.status(201).json({ message: 'Examen créé avec succès', examen });
    } catch (error) {
        console.error("Error saving exam:", error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'examen', error });
    }
};

// controlleur pour get tous les examens
const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find({});
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des examens', error });
    }
};

module.exports = {
    createExam,
    getAllExams
};
