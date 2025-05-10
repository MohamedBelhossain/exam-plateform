const express=require("express");
const router=express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 



router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({ message: 'Échec de l\'authentification', info });
        }

        // Créer un JWT
        const payload = { userId: user.id };
        const token = jwt.sign(payload, 'tonSecret', { expiresIn: '1h' });

        return res.json({ message: 'Authentification réussie', token });
    })(req, res, next);
});

// Route d'enregistrement (si nécessaire)
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà pris.' });
        }

        const newUser = new User({ email, password });
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// Registe
  // Logout route
  router.get("/logout", (req, res) => {
  
  });


// Middleware pour vérifier le JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Récupérer le token à partir de l'en-tête Authorization

    if (!token) {
        return res.status(403).json({ message: 'Token manquant' });
    }

    jwt.verify(token, 'tonSecret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.userId = decoded.userId; // Ajouter l'ID de l'utilisateur à la requête pour pouvoir l'utiliser ensuite
        next();
    });
}

module.exports = verifyToken;
module.exports=router;

