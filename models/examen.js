const mongoose = require('mongoose');

const examenSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String, required: true },
    public: { type: String, required: true },
    lienAcces: { type: String, required: true }
});

const Exam = mongoose.model('Exam', examenSchema);

module.exports = Exam;