const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ton modèle d'utilisateur

// Définir la stratégie locale pour la connexion
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
        User.findOne({ email }, (err, user) => {
            if (err) return done(err);
            if (!user || !user.validatePassword(password)) {
                return done(null, false, { message: 'Identifiants incorrects' });
            }
            return done(null, user);
        });
    }
));

// Sérialiser l'utilisateur dans le token JWT
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Désérialiser l'utilisateur à partir du token JWT
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
