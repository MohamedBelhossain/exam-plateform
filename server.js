const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();


// Configuration EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout'); // Layout par défaut
app.set('views',__dirname + '/views'); // Chemin absolu vers le dossier views





// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));





// Routes principales
app.get('/accueil', (req, res) => res.render('accueil'));
app.get('/main', (req, res) => res.render('main'));
app.get('/about', (req, res) => res.render('about'));
app.get('/config', (req, res) => res.render('config'));
app.get('/connexion', (req, res) => res.render('connexion'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/forgot', (req, res) => res.render('forgot'));
app.get('/inscrire', (req, res) => res.render('inscrire'));
app.get('/no-pas', (req, res) => res.render('no.pas'));
app.get('/verification-email', (req, res) => res.render('verification_email'));




app.use((req, res) => {
    res.status(404).render('404', { 
        title: 'Page introuvable' // Important pour le titre
    });
});


// Gestion des erreurs 404
app.use((req, res) => res.status(404).render('404'));

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));



