const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');

// Helper function for sending verification email
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

// Controller for registration
exports.register = async (req, res) => {
  try {
    const { email, password, nom, prenom, dateNaissance, sexe, etablissement, filiere, role } = req.body;

    console.log("📥 Données reçues:", { email, nom, prenom, role });

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.warn("❌ Utilisateur déjà existant");
      return res.status(400).json({ message: "L'utilisateur existe déjà avec cet email" });
    }

    const user = new User({
      email,
      password,
      nom,
      prenom,
      dateNaissance,
      sexe,
      etablissement,
      filiere,
      role,
    });

    const token = user.generateVerificationToken();
    await user.save();
    console.log("✅ Utilisateur enregistré");

    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    try {
      await sendVerificationEmail(email, token);
      console.log("📧 Email de vérification envoyé");
    } catch (emailError) {
      console.error("❌ Erreur lors de l'envoi de l'email:", emailError.message);
    }

    return res.status(201).json({
      message: "Inscription réussie",
      user: userWithoutPassword,
      authToken,
    });
  } catch (error) {
    console.error("❌ Erreur globale lors de l'inscription:", error);
    return res.status(500).json({ message: "Erreur lors de l'inscription: " + error.message });
  }
};

// Controller for login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect ou compte non activé' });
    }

    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      message: 'Connexion réussie',
      token: authToken,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

// Controller for password reset (forgot password)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Aucun compte trouvé avec cet email' });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    res.status(200).json({ message: 'Un email de réinitialisation a été envoyé à votre adresse email' });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation' });
  }
};

// Controller for resetting password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};
