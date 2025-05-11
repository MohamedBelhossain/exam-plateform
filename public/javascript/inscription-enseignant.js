document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('inscriptionForm');
    
    if (!form) {
        console.error("Le formulaire d'inscription n'a pas été trouvé dans le document.");
        return;
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

        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!emailRegex.test(email)) {
            alert('Veuillez entrer une adresse email valide');
            return;
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
}
 else {
                const errorData = await response.json();
                alert(errorData.message || 'Une erreur est survenue lors de l\'inscription');
            }

        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de la connexion au serveur');
        }
    });

    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.value) {
            input.parentElement.classList.add('active');
        }
        
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('active');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('active');
            }
        });
    });
});
