// const EtudiantData = require('../models/EtudiantDataSchema');
const EtudiantDataSchema = require('../models/EtudiantDataSchema');
const questions = [{
        question: " Question 1: Quel est le résultat de l'expression suivante en JavaScript console.log(5 + '5');",
        options: ["A) 10", "B) 55", "C) NaN", "D) Erreur"],
        correct: 1
    },
    {
        question: "Question 2: Quel mot-clé permet de déclarer une variable qui ne peut pas être modifiée après sa déclaration ?",
        options: ["A) let", "B) var", "C) const", "D) static"],
        correct: 2
    },
    {
        question: "Question 3:Quelle méthode permet d'ajouter un élément à la fin d'un tableau en JavaScript ?",
        options: ["A) pop()", "B) push()", "C) shift()", "D) unshift()"],
        correct: 1
    },
    {
        question: "Question 4:Quel est le résultat de l'expression suivante en JavaScript :console.log('2' - 1);",
        options: ["A) 1", "B) '1'", "C) NaN", "D) '2'"],
        correct: 0
    }
];
exports.getQuestions = (req, res) => {
    res.json(questions);
};
exports.saveLocation = async(req, res) => {
    const { userId, latitude, longitude } = req.body;

    if (!userId || !latitude || !longitude) {
        return res.status(400).json({ error: 'Données manquantes.' });
    }

    try {
        let etudiant = await EtudiantDataSchema.findOne({ userId });

        if (etudiant) {
            etudiant.latitude = latitude;
            etudiant.longitude = longitude;
            etudiant.timestamp = new Date();
            await etudiant.save();
        } else {
            etudiant = new EtudiantDataSchema({
                userId,
                latitude,
                longitude,
                timestamp: new Date()
            });
            await etudiant.save();
        }

        res.status(200).json({ message: 'Localisation enregistrée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la localisation:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};
exports.saveScore = async(req, res) => {
    const { userId, score } = req.body;

    if (!userId || score == null) {
        return res.status(400).json({ error: 'Données manquantes.' });
    }

    try {
        let etudiant = await EtudiantDataSchema.findOne({ userId });

        if (etudiant) {
            etudiant.score = score;
            etudiant.date = new Date();
            await etudiant.save();
        } else {
            etudiant = new EtudiantDataSchema({
                userId,
                score,
                date: new Date()
            });
            await etudiant.save();
        }

        res.status(200).json({ message: 'Score enregistré avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du score:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};