const express = require('express');
const router = express.Router();
const examController = require('../controllers/enseignant');

const ExamResult = require('../models/examResult'); 
const User = require('../models/user'); 

router.get("/", (req, res) => {
    res.render("etudiant/etudiant");
});


router.post('/submit-exam', async (req, res) => {
  try {
    const { user, score, geolocation } = req.body; // Extract the necessary data

    // Validate that the user exists in the database
    const foundUser = await User.findById(user);
    if (!foundUser) {
      return res.status(400).send('User not found');
    }

    // Create a new exam result document
    const newExamResult = new ExamResult({
      user,
      score,
      geolocation
    });

    // Save the document to the database
    await newExamResult.save();

    res.send('Exam result submitted successfully!');
  } catch (error) {
    console.error('Error saving exam result:', error); // Log any error
    res.status(500).send('Error saving exam result.');
  }
});
module.exports = router;