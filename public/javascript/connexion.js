document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error("Le formulaire de connexion n'a pas été trouvé dans le document.");
        return;
    }
    
    // Élément pour les messages d'erreur globaux
    let errorElement = document.querySelector('.global-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'global-error';
        loginForm.appendChild(errorElement);
    }
    
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log("Formulaire de connexion soumis");
        
        // Réinitialiser les messages d'erreur
        errorElement.textContent = '';
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Affichage des valeurs dans la console pour debugging
        console.log("Email:", email);
        console.log("Mot de passe fourni:", password ? "Oui" : "Non");
        
        // Validation de l'email
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!emailRegex.test(email)) {
            errorElement.textContent = 'Veuillez entrer une adresse email valide';
            return;
        }
        
        // Validation du mot de passe (non vide)
        if (!password) {
            errorElement.textContent = 'Veuillez entrer votre mot de passe';
            return;
        }
        
        // Désactiver le bouton pendant la tentative de connexion
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Connexion en cours...';
        
        // Envoi des données au serveur
        try {
            console.log("Tentative de connexion...");
            
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            console.log("Statut de la réponse:", response.status);
            
            const data = await response.json();
            console.log("Données reçues:", data);
            
            if (response.ok) {
                // Stockage du token dans le localStorage
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    console.log("Token stocké dans localStorage");
                }
                
                // Stockage des informations de l'utilisateur
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    console.log("Informations utilisateur stockées dans localStorage");
                }
                
                // Redirection basée sur le rôle de l'utilisateur
                let redirectUrl = '/principale'; // Par défaut
                
                if (data.user && data.user.role) {
                    if (data.user.role === 'enseignant') {
                        redirectUrl = '/enseignant';
                    } else if (data.user.role === 'etudiant') {
                        redirectUrl = '/etudiant';
                    }
                }
                
                // Affichage d'un message de succès
                errorElement.textContent = 'Connexion réussie ! Redirection en cours...';
                errorElement.style.color = 'green';
                
                // Redirection après un court délai
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            } else {
                // Réactiver le bouton
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                
                // Affichage de l'erreur
                errorElement.textContent = data.message || 'Identifiants incorrects';
            }
        } catch (error) {
            console.error('Erreur:', error);
            
            // Réactiver le bouton
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            
            errorElement.textContent = 'Une erreur est survenue lors de la connexion au serveur';
        }
    });
    
    // Animation des labels
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        // Ajout de la classe active si l'input a une valeur
        if (input.value) {
            input.classList.add('active');
            if (input.nextElementSibling && input.nextElementSibling.tagName === 'LABEL') {
                input.nextElementSibling.classList.add('active');
            }
        }
        
        // Ajout de la classe active lors du focus
        input.addEventListener('focus', function() {
            this.classList.add('active');
            if (this.nextElementSibling && this.nextElementSibling.tagName === 'LABEL') {
                this.nextElementSibling.classList.add('active');
            }
        });
        
        // Suppression de la classe active si l'input n'a pas de valeur
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.classList.remove('active');
                if (this.nextElementSibling && this.nextElementSibling.tagName === 'LABEL') {
                    this.nextElementSibling.classList.remove('active');
                }
            }
        });
    });
});