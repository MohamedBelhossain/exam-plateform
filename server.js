
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");

const cors= require('cors');
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const enseignantRouter = require("./routes/enseignant"); 
const etudiantRouter = require("./routes/etudiant"); 
const authRouter= require("./routes/auth");

app.use("/enseignant", enseignantRouter);  
app.use("/etudiant", etudiantRouter);  
app.use("/auth",authRouter);

// Importation du contrôleur d'examen pour la route publique
const examController = require('./controllers/enseignant');

// Route publique pour accéder aux examens par UUID
app.get("/examen/:uuid", examController.getExamByUUID);

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
  const multer = require('multer');
  const path = require('path');
  
  // Définir l'emplacement et le nom du fichier
  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, 'public/uploads'); // Dossier où les fichiers seront enregistrés
      },
      filename: function (req, file, cb) {
          cb(null, Date.now() + path.extname(file.originalname)); // Nom du fichier unique
      }
  });
  
  // Filtrer les fichiers acceptés (image, audio, vidéo)
  const fileFilter = (req, file, cb) => {
      const allowedTypes = ['image', 'audio', 'video'];
      const mimeType = file.mimetype.split('/')[0];
      if (allowedTypes.includes(mimeType)) {
          cb(null, true);
      } else {
          cb(new Error('Fichier non supporté'), false);
      }
  };
  
  const upload = multer({ storage, fileFilter });
  
  // Dans ta route de création de question
  app.post('/enseignant/examens/:uuid/add-questions', upload.single('media'), (req, res) => {
      
      const mediaPath = req.file ? '/uploads/' + req.file.filename : null; 
  
      // Crée une nouvelle question avec les données envoyées par le formulaire, y compris le chemin du fichier
      const newQuestion = {
          enonce: req.body.enonce,
          type: req.body.type,
          choix: req.body.choix,
          bonneReponse: req.body.bonneReponse,
          points: req.body.points,
          media: mediaPath, // Ajouter le lien vers le fichier média
      };
  });
  
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});



