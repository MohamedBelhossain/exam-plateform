// models/examen.js
const mongoose = require('mongoose');
const questionSchema = require('./question').schema;

const examenSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String, required: true },
    public: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    dateCreation: { type: Date, default: Date.now },
    questions: { type: [questionSchema], default: [] }
   
});

// Méthode virtuelle pour générer le lien d'accès complet
examenSchema.virtual('lienAcces').get(function() {
    return `/examen/${this.uuid}`;
});

// Inclure les virtuels lors de la conversion en JSON
examenSchema.set('toJSON', { virtuals: true });
examenSchema.set('toObject', { virtuals: true });

const Exam = mongoose.model('Exam', examenSchema);

module.exports = Exam;



