const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path'); // Added path module for joining paths
require('dotenv').config();

// Initialize app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Method override for RESTful forms
app.use(methodOverride('_method'));
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Configuration de multer pour traiter les formulaires multipart/form-data
const upload = multer();

// Middleware pour les formulaires multipart qui contiennent _method
app.use((req, res, next) => {
  if (req.is('multipart/form-data') && req.body && req.body._method) {
    req.method = req.body._method.toUpperCase();
    console.log(`Méthode modifiée via multipart: ${req.method}`);
  }
  next();
});

// View engine setup
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

// Properly serve static files with correct content types
app.use(express.static(path.join(__dirname, "public")));
app.use('/css', express.static(path.join(__dirname, "public/css"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));
app.use('/js', express.static(path.join(__dirname, "public/js"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
app.use('/images', express.static(path.join(__dirname, "public/images")));

// MongoDB connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // 30 seconds timeout
})
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB Atlas:", error);
  });
// Import routes and controllers with correct destructuring
const enseignantRouter = require("./routes/enseignant");
const etudiantRouter = require("./routes/etudiant");
const principaleRouter = require('./routes/principale');
const userController = require('./controllers/userController');
const { auth, redirectIfAuthenticated } = require('./middlewares/authentification');

// Setup authentication routes
app.post('/api/users/register', userController.register);


app.post('/api/users/login', userController.login);
app.post('/api/users/forgot-password', userController.forgotPassword);
app.post('/api/users/reset-password', userController.resetPassword);

// Verification email handling
app.get('/verification_email', (req, res) => {
  res.render('principale/verification_email', { 
    message: 'Un email de vérification a été envoyé à votre adresse email.' 
  });
});

// Verification token route (pour lien cliquable dans email)
app.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const User = require('./models/user');
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).render('principale/verification-error', {
        message: 'Token de vérification invalide ou expiré.'
      });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.render('principale/verification-success', {
      message: 'Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.'
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(500).render('principale/verification-error', {
      message: 'Une erreur est survenue lors de la vérification.'
    });
  }
});

// API pour vérifier le code entré par l'utilisateur
app.post('/api/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const User = require('./models/user');
    const user = await User.findOne({ email, verificationToken: code });

    if (!user) {
      return res.status(400).json({ message: 'Code de vérification invalide' });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email vérifié avec succès' });
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification' });
  }
});

// API pour renvoyer le code de vérification
app.post('/api/resend', async (req, res) => {
  try {
    const { email } = req.body;
    const User = require('./models/user');
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(email, user.verificationToken);
    console.log("📧 Email de vérification renvoyé");
    res.status(200).json({ message: 'Code renvoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors du renvoi du code:', error);
    res.status(500).json({ message: 'Erreur lors du renvoi du code' });
  }
});

// Mount routes - removed duplicates
app.use("/enseignant", enseignantRouter);
app.use("/etudiant", etudiantRouter);
app.use('/principale', principaleRouter);

// Fix the user routes to use the fixed user.js with auth middleware
app.use('/api/users', require('./routes/user'));

// Main route
app.get('/main', (req, res) => {
  res.render('principale/main');
});

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/principale/accueil');
});

// Import exam controller for public routes
const examController = require('./controllers/enseignant');
app.get("/examen/:uuid", examController.getExamByUUID);

// Function to send verification email using Nodemailer
const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Votre Site" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Vérifiez votre adresse e-mail",
    html: `<p>Voici votre code de vérification : <strong>${token}</strong></p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email envoyé à ${email}`);
  } catch (error) {
    console.error("❌ Échec d'envoi de l'email:", error.message);
    throw new Error("Erreur lors de l'envoi de l'email");
  }
};

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('error/404', {
    message: `L'URL demandée n'existe pas: ${req.url}`
  });
});

// Global error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('error/500');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;