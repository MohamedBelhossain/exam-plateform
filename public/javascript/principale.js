
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    if (!emailRegex.test(email)) {
        showError('email inccorect', 'email');
        return;
    }
    
    if (password.length < 8) {
        showError(' password too short', 'password');
        return;
    }
    
    loginSuccessful();
});

function showError(message, fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ff4444;
        font-size: 0.8rem;
        position: absolute;
        bottom: -20px;
        left: 10px;
        animation: shake 0.4s ease-in-out;
    `;
    
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    field.parentNode.appendChild(errorElement);
    
    field.style.animation = 'shake 0.4s ease-in-out';
    setTimeout(() => field.style.animation = '', 400);
}

function loginSuccessful() {
    const btn = document.querySelector('.login-btn');
    btn.textContent = 'Connexion réussie ✓';
    btn.style.backgroundColor = '#00C851';
    
    btn.style.animation = 'bounce 0.6s ease';
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
    
    localStorage.setItem('loggedIn', 'true');
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            this.parentNode.querySelector('label').style.color = '#ff4444';
        } else {
            this.parentNode.querySelector('label').style.color = '#fff';
        }
    });
});


const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input, select');
    const debug = true; // Activer les logs de débogage

    // Initialisation des écouteurs d'événements
    function initEventListeners() {
        inputs.forEach(input => {
            input.addEventListener('input', () => validateField(input));
            input.addEventListener('blur', () => validateField(input));
        });

        form.addEventListener('submit', handleFormSubmit);
    }

    // Gestion de la soumission du formulaire
    async function handleFormSubmit(e) {
        e.preventDefault();
        if(debug) console.log('--- Début de la soumission ---');

        let isFormValid = true;
        
        // Validation de tous les champs
        inputs.forEach(input => {
            const isValid = validateField(input);
            if(debug) console.log(`${input.name}: ${isValid ? 'Valide' : 'Invalide'}`);
            isFormValid = isFormValid && isValid;
        });

        if(debug) console.log(`Formulaire ${isFormValid ? 'Valide' : 'Invalide'}`);

        if(isFormValid) {
            if(debug) console.log('Préparation des données...');
            const formData = prepareFormData();
            
            try {
                const response = await sendFormData(formData);
                handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        }
    }

    // Validation des champs
    function validateField(field) {
        const value = field.value.trim();
        let isValid = false;

        switch(field.name) {
            case 'email':
                isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
                break;
            case 'nom':
            case 'prenom':
                isValid = /^[a-zA-ZÀ-ÿ\s-]{2,}$/.test(value);
                break;
            case 'naissance':
                isValid = value && calculateAge(value) >= 13;
                break;
            case 'sexe':
                isValid = value !== '';
                break;
            case 'filiere':
            case 'etablissement':
                isValid = value.length >= 2;
                break;
            default:
                isValid = true;
        }

        updateFieldStatus(field, isValid);
        return isValid;
    }

    // Préparation des données
    function prepareFormData() {
        return {
            email: form.email.value.trim(),
            nom: form.nom.value.trim(),
            prenom: form.prenom.value.trim(),
            naissance: form.naissance.value,
            sexe: form.sexe.value,
            filiere: form.filiere.value.trim(),
            etablissement: form.etablissement.value.trim()
        };
    }

    // Envoi des données
    async function sendFormData(data) {
        if(debug) console.log('Envoi des données:', data);
        
        return await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    // Gestion de la réponse
    function handleResponse(response) {
        if(debug) console.log('Statut de la réponse:', response.status);
        
        if(response.ok) {
            sessionStorage.setItem('pendingEmail', form.email.value.trim());
            window.location.href = 'verification_email.html';
        } else {
            showGlobalError('Erreur serveur : Veuillez réessayer');
        }
    }

    // Gestion des erreurs
    function handleError(error) {
        if(debug) console.error('Erreur:', error);
        showGlobalError('Connexion au serveur impossible');
    }

    // Calcul de l'âge
    function calculateAge(dateString) {
        if(!dateString) return 0;
        
        const birthDate = new Date(dateString);
        if(isNaN(birthDate)) return 0;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if(monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // Mise à jour visuelle des champs
    function updateFieldStatus(field, isValid) {
        const parent = field.parentElement;
        const error = parent.querySelector('.error') || document.createElement('div');
        
        field.style.borderColor = isValid ? '#4CAF50' : '#ff4444';
        
        if(!isValid) {
            error.className = 'error';
            error.textContent = getErrorMessage(field);
            if(!parent.contains(error)) parent.appendChild(error);
        } else {
            error.remove();
        }
    }

    // Messages d'erreur
    function getErrorMessage(field) {
        const messages = {
            email: 'Adresse email invalide',
            nom: '2 caractères minimum requis',
            prenom: '2 caractères minimum requis',
            naissance: 'Âge minimum requis : 13 ans',
            sexe: 'Sélection obligatoire',
            filiere: 'Nom de filière trop court',
            etablissement: 'Nom d\'établissement trop court'
        };
        return messages[field.name] || 'Erreur de validation';
    }

    // Affichage des erreurs globales
    function showGlobalError(message) {
        const errorDiv = document.querySelector('.global-error') || document.createElement('div');
        errorDiv.className = 'global-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff4444;
            padding: 15px;
            margin: 20px 0;
            border: 1px solid #ff4444;
            border-radius: 5px;
            background: #ffecec;
        `;

        if(!document.body.contains(errorDiv)) {
            form.parentNode.insertBefore(errorDiv, form.nextSibling);
        }
    }

    // Initialisation
    initEventListeners();
});

document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('pendingEmail')) {
        window.location.href = 'inscri.html';
    }

    const form = document.querySelector('form');

    function validatePassword(password) {
        const hasMinLength = password.length >= 8;
        const hasNumber = /\d/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        return hasMinLength && hasNumber && hasUppercase;
    }
    

    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirmPassword').value;


        if(!validatePassword(password)) {
            showError('Le mot de passe doit contenir 8 caractères, 1 chiffre et 1 majuscule');
            return;
        }




        if(password !== confirm) {
            showError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const response = await fetch('/set-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: sessionStorage.getItem('pendingEmail'),
                    password
                })
            });

            if(response.ok) {
                sessionStorage.removeItem('pendingEmail');
                window.location.href = 'connexion.html';
            }
        } catch (error) {
            showError('Erreur de serveur');
        }
        
    });
});