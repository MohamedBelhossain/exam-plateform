document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input, select');
    
    // التحقق في الوقت الحقيقي
    inputs.forEach(input => {
        input.addEventListener('input', () => validateField(input));
        input.addEventListener('blur', () => validateField(input));
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let formValid = true;

        inputs.forEach(input => formValid &= validateField(input));

        if(formValid) {
            const formData = {
                email: form.email.value,
                nom: form.nom.value,
                prenom: form.prenom.value,
                naissance: form.naissance.value,
                sexe: form.sexe.value,
                filiere: form.filiere.value,
                etablissement: form.etablissement.value
            };

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });

                if(response.ok) {
                    sessionStorage.setItem('pendingEmail', form.email.value);
                    window.location.href = 'verification_email.html';
                } else {
                    showGlobalError('Erreur lors de l\'inscription');
                }
            } catch (error) {
                showGlobalError('Erreur réseau');
            }
        }
    });

    // باقي الدوال بدون تغيير...
});

    function validateField(field) {
        let valid = true;
        const value = field.value.trim();

        switch(field.name) {
            case email:
                valid = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(value);
                break;
            case nom:
            case prenom:
                valid = /^[a-zA-ZÀ-ÿ\s-]{2,}$/.test(value);
                break;
            case naissance:
                valid = calculateAge(value) >= 13;
                break;
            case sexe:
                valid = value !== '';
                break;
            case filiere:
            case etablissement:
                valid = value.length >= 2;
                break;
        }

        updateFieldStatus(field, valid);
        return valid;
    }

    function calculateAge(dateString) {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        if(today.getMonth() < birthDate.getMonth() || 
          (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function updateFieldStatus(field, isValid) {
        if(isValid) {
            field.style.borderColor = '#4CAF50';
            field.parentElement.querySelector('.error')?.remove();
        } else {
            field.style.borderColor = '#ff4444';
            const error = field.parentElement.querySelector('.error') || document.createElement('div');
            error.className = 'error';
            error.textContent = getErrorMessage(field);
            field.parentElement.appendChild(error);
        }
    }

    function getErrorMessage(field) {
        const messages = {
            email: 'Email invalide',
            nom: 'Nom requis (2 caractères min)',
            prenom: 'Prénom requis (2 caractères min)',
            naissance: 'Vous devez avoir +13 ans',
            sexe: 'Sélection obligatoire',
            filiere: 'Filière requise',
            etablissement: 'Établissement requis'
        };
        return messages[field.name];
    }

    function showGlobalError(message) {
        const existingError = document.querySelector('.global-error');
        const errorElement = existingError || document.createElement('div');
        errorElement.className = 'global-error';
        errorElement.textContent = message;
        errorElement.style.color = '#ff4444';
        errorElement.style.textAlign = 'center';
        errorElement.style.marginTop = '1rem';
        
        if(!existingError) {
            form.appendChild(errorElement);
        }
    }