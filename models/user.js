const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // or any other fields
});

module.exports = mongoose.model('User', userSchema);