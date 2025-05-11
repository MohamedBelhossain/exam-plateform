const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email invalid');
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  dateNaissance: {
    type: Date
  },
  sexe: {
    type: String,
    enum: ['homme', 'femme', 'autre']
  },
  etablissement: {
    type: String,
    trim: true
  },
  filiere: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['etudiant', 'enseignant', 'admin'],
    default: 'etudiant'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  verified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Méthode pour générer un token de vérification
userSchema.methods.generateVerificationToken = function() {
  this.verificationToken = crypto.randomBytes(32).toString('hex');
  return this.verificationToken;
};

// Méthode pour générer un token JWT et sauvegarder l'utilisateur
userSchema.methods.generateAuthTokenAndSaveUser = async function() {
  const user = this;
  const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  await user.save();
  return token;
};

// Méthode pour trouver un utilisateur par email et mot de passe
userSchema.statics.findUser = async function(email, password) {
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('Identifiants invalides');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error('Identifiants invalides');
  }
  
  return user;
};

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  const user = this;
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  
  next();
});
const User = mongoose.model('User', userSchema);
module.exports = User;
User.collection.createIndex({ verificationToken: 1 }, { expireAfterSeconds: 600 }); // Expire après 10 minutes


