const express=require("express");
const router=express.Router();
const User = require("../models/User");
router.get("/",(req,res)=>{
res.render("espace-enseignant");
})

// Register route
router.post("/register", async (req, res) => {
   
  });
  
  // Login route
  router.post("/login", async (req, res) => {
    
  });
  
  // Logout route
  router.get("/logout", (req, res) => {
  
  });
module.exports=router;

