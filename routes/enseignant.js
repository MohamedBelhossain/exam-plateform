

const express = require("express");
const router = express.Router();
const Exam = require("../models/examen"); 


router.get("/", (req, res) => {
    res.render("enseignant/enseignant");
});


router.post('/create-exams', async (req, res) => {
    try {
        const { titre, description, publicCible } = req.body;

       
        if (!titre || !description || !publicCible) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        
        const uuid = Math.random().toString(36).substring(2, 10); 
        const lienAcces = `http://${req.get('host')}/examen/${uuid}`;

        // Create a new exam
        const examen = new Exam({
            titre,
            description,
            public: publicCible,
            lienAcces  // Save the generated link
        });

        // Save the exam to the database
        await examen.save();

        console.log("Examen saved to database:", examen);

        // Respond to the client
        res.status(201).json({ message: 'Examen créé avec succès', examen });
    } catch (error) {
        console.error("Error saving exam:", error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'examen', error });
    }
});

router.get('/examen/:uuid', async (req, res) => {
    try {
        const { uuid } = req.params;  
        console.log("Requested UUID:", uuid);  // Debugging: Log the received UUID

        // Construct the lienAcces link based on the uuid
        const lienAcces = `http://${req.get('host')}/examen/${uuid}`;
        console.log('Generated lienAcces:', lienAcces);  // Debugging: Log the generated lienAcces

        const exam = await Exam.findOne({ lienAcces }); // Find the exam using the lienAcces

        if (!exam) {
            console.log('No exam found for this UUID');
            return res.status(404).send('Examen non trouvé');
        }

        res.render('examDetail', { exam });  // Render the exam details
    } catch (error) {
        console.error("Error fetching exam:", error);
        res.status(500).send('Erreur lors de la récupération de l\'examen');
    }
});

router.get('/examens', async (req, res) => {
    try {
        const exams = await Exam.find(); 
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des examens', error });
    }
});



module.exports = router;
