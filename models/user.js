const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: value => validator.isEmail(value),
      message: 'Email invalide'
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
  dateNaissance: Date,
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
    enum: ['etudiant', 'enseignant', 'admin'],
    default: 'etudiant'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationToken: String, // code à 6 chiffres
  verificationTokenExpires: Date, // date d'expiration du code
  verified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

/**
 * Génère un code de vérification à 6 chiffres lisible
 * et stocke sa date d’expiration (10 minutes)
 */
userSchema.methods.generateVerificationToken = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // ex: "345678"
  this.verificationToken = code;
  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000; // expire dans 10 minutes
  return code;
};

// Générer un token JWT d'authentification
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { userId: this._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Vérifie email + mot de passe
userSchema.statics.findUser = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error('Identifiants invalides');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Identifiants invalides');

  return user;
};

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;



