document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('inscriptionForm');
    
    if (!form) {
        console.error("Le formulaire d'inscription n'a pas été trouvé dans le document.");
        return;
    }

    // Add active class to labels with prefilled inputs
    const initFormFields = () => {
        const inputs = document.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            // Check if the input has a value
            if (input.value.trim() !== '') {
                input.parentElement.classList.add('active');
            } else {
                input.parentElement.classList.remove('active');
            }
        });
    };

    // Run this first to handle any preloaded values
    initFormFields();

    // Setup event listeners for inputs to handle focus/blur
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        // Focus event - always add active class
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('active');
        });
        
        // Blur event - only remove active class if empty
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.parentElement.classList.remove('active');
            }
            
            // Additional validation for email when blurring the email field
            if (this.id === 'email') {
                validateUAEEmail(this.value);
            }
        });
        
        // Input event - add active class when typing, remove if cleared
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.parentElement.classList.add('active');
            } else {
                this.parentElement.classList.remove('active');
            }
            
            // Live validation for email as user types
            if (this.id === 'email') {
                const emailInput = document.getElementById('email');
                const emailError = document.getElementById('email-error');
                
                // Remove any error styles if the field is empty
                if (this.value.trim() === '') {
                    emailInput.classList.remove('error-input');
                    if (emailError) emailError.style.display = 'none';
                }
            }
        });
    });
    
    // Function to validate UAE student email
    function validateUAEEmail(email) {
        const emailInput = document.getElementById('email');
        let emailError = document.getElementById('email-error');
        
        // Create error message element if it doesn't exist
        if (!emailError) {
            emailError = document.createElement('div');
            emailError.id = 'email-error';
            emailError.className = 'error-message';
            emailInput.parentElement.appendChild(emailError);
        }
        
        // Only validate if there's actually content
        if (email.trim() === '') {
            emailInput.classList.remove('error-input');
            emailError.style.display = 'none';
            return true;
        }
        
        // Check if the email ends with @etu.uae.ac.ma
        const uaeEmailRegex = /^[a-z0-9._%+-]+@etu\.uae\.ac\.ma$/i;
        
        if (!uaeEmailRegex.test(email)) {
            emailInput.classList.add('error-input');
            emailError.textContent = 'L\'email doit se terminer par @etu.uae.ac.ma';
            emailError.style.display = 'block';
            return false;
        } else {
            emailInput.classList.remove('error-input');
            emailError.style.display = 'none';
            return true;
        }
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log("Formulaire soumis");
        
        const email = document.querySelector('#email').value;
        const nom = document.querySelector('#nom').value;
        const prenom = document.querySelector('#prenom').value;
        const dateNaissance = document.querySelector('#dateNaissance').value;
        const sexe = document.querySelector('#sexe').value;
        const etablissement = document.querySelector('#etablissement').value;
        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('#confirmPassword').value;

        console.log("Données saisies:", email, nom, prenom, dateNaissance, sexe, etablissement);

        // Validate UAE student email
        if (!validateUAEEmail(email)) {
            return; // Stop form submission if email is invalid
        }

        if (!nom || !prenom || !dateNaissance || !sexe || !etablissement || !password || !confirmPassword) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 8) {
            alert('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        const birthDate = new Date(dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 16) {
            alert('Vous devez avoir au moins 16 ans pour vous inscrire');
            return;
        }

        const userData = {
            email,
            nom,
            prenom,
            dateNaissance,
            sexe,
            etablissement,
            password,
            role: 'enseignant' // ou 'enseignant' si nécessaire
        };

        try {
            console.log("Envoi des données:", userData);

            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Réponse:", data);
                
                // ✅ Stocker le token dans localStorage
                if (data.authToken) {
                    localStorage.setItem('token', data.authToken);
                }

                // Enregistrer l'email pour vérification
                sessionStorage.setItem('pendingEmail', email);
                
                alert('Inscription réussie! Vous allez recevoir un email de vérification.');
                window.location.href = '/verification_email';
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Une erreur est survenue lors de l\'inscription');
            }

        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de la connexion au serveur');
        }
    });
});