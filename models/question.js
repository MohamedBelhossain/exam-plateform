const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    enonce: String,
    type: String, // "qcm" ou "directe"
    choix: [String],
    bonneReponse: [String], 
    points: Number,
    media: { type: String, default: null },
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;


