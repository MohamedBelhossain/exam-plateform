const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { auth } = require('../middlewares/authentification');  // Import the auth function
const userController = require('../controllers/userController');

// Change from authMiddleware to auth
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({});
    // Remove password from each user
    const sanitizedUsers = users.map(user => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });
    res.status(200).json(sanitizedUsers);
  } catch (e) {
    console.error('Error fetching users:', e);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// routes/user.js




// Public routes (no authentication required)
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

//


// Example of another protected route
router.put('/update-profile', auth, async (req, res) => {
  try {
    // Example functionality - update user profile
    // Implementation would go here
    res.status(200).json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
});




/**
 * Route for getting the current user profile (GET /api/users/me)
 * Protected with authentication middleware
 */

router.get('/me', auth, async (req, res) => {
  try {
    // User info is already available in req.user from the auth middleware
    const userWithoutPassword = req.user.toObject();
    delete userWithoutPassword.password;
    
    res.status(200).json(userWithoutPassword);
  } catch (e) {
    console.error('Error fetching user profile:', e);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['nom', 'prenom', 'etablissement', 'filiere']; // Limit what can be updated
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).json({ message: 'Mises à jour non valides' });
  }
  
  try {
    // Update user fields
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    
    // Return updated user without password
    const userWithoutPassword = req.user.toObject();
    delete userWithoutPassword.password;
    
    res.status(200).json({ 
      message: 'Profil mis à jour avec succès',
      user: userWithoutPassword
    });
  } catch (e) {
    console.error('Error updating user profile:', e);
    res.status(400).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
});

router.patch('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Les nouveaux mots de passe ne correspondent pas' });
    }
    
    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
      });
    }
    
    // Verify current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }
    
    // Update password
    req.user.password = newPassword; // The pre-save hook will hash it
    await req.user.save();
    
    res.status(200).json({ message: 'Mot de passe modifié avec succès' });
  } catch (e) {
    console.error('Error changing password:', e);
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
  }
});

module.exports = router;