const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send("Étudiant route placeholder");
});

module.exports = router;