
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


app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});



