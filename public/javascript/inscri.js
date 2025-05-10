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