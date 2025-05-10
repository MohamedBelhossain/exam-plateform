
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require('method-override');


const cors= require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Middleware method-override ensuite (avec de multiples méthodes de détection)
app.use(methodOverride('_method')); // Pour les requêtes query string comme ?_method=DELETE
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Configuration de multer pour traiter les formulaires multipart/form-data
const multer = require('multer');
const upload = multer(); // Pour gérer les formulaires multipart/form-data

// Middleware pour les formulaires multipart qui contiennent _method
app.use((req, res, next) => {
  if (req.is('multipart/form-data') && req.body && req.body._method) {
    req.method = req.body._method.toUpperCase();
    console.log(`Méthode modifiée via multipart: ${req.method}`);
  }
  next();
});


const enseignantRouter = require("./routes/enseignant"); 
const etudiantRouter = require("./routes/etudiant"); 
const authRoutes= require("./routes/auth");

app.use("/enseignant", enseignantRouter);  
app.use("/etudiant", etudiantRouter);  

// Importation du contrôleur d'examen pour la route publique
const examController = require('./controllers/enseignant');

// Route publique pour accéder aux examens par UUID
app.get("/examen/:uuid", examController.getExamByUUID);
require('./config/passport'); // Assurez-vous que le fichier de configuration de Passport est chargé

// Utiliser les routes d'authentification
app.use('/auth', authRoutes);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");


app.use(expressLayouts);
app.use(express.static("public"));

require('dotenv').config();

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });
  
  // Gestionnaire d'erreur 404 pour les routes non trouvées
  app.use((req, res, next) => {
    res.status(404).send(`
      <h1>Page non trouvée</h1>
      <p>L'URL demandée n'existe pas: ${req.url}</p>
      <a href="/enseignant">Retour à la page principale</a>
    `);
  });
     
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});



