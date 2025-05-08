const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    latitude: Number,
    longitude: Number,
    score: Number,
    date: Date
});
const EtudiantDataSchema = mongoose.model('Etudiant', etudiantSchema);

module.exports = EtudiantDataSchema;