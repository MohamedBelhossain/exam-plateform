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