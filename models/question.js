const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  enonce: { type: String, required: true },
  type: { type: String, enum: ['qcm', 'directe'], required: true },

  // QCM
  choix: [String],             
  bonneReponse: [String],      

  // Directe
  reponse: { type: String },   
  tolerance: { type: Number }, 

  // Commun
  points: Number,            
  media: { type: String, default: null },
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;

