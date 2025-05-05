
// controllers/examController.js

const Exam = require('../models/Exam'); // Import the Exam model (if using MongoDB)

// Controller to handle the creation of an exam
const createExam = async (req, res) => {
    try {
        const { titre, description, publicCible } = req.body;

        // Validate the input fields
        if (!titre || !description || !publicCible) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        // Generate a unique access link
        const uuid = Math.random().toString(36).substring(2, 10); // Simple UUID generation
        const lienAcces = `https://monexam.com/examen/${uuid}`;

        // Create the exam object
        const examen = new Exam({
            titre,
            description,
            publicCible,
            lienAcces
        });

        // Save the exam to the database (if using MongoDB)
        await examen.save();

        // Send the response with the created exam and the generated link
        res.status(201).json({ message: 'Examen créé avec succès', examen });

    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Erreur lors de la création de l\'examen', error });
    }
};

module.exports = { createExam };