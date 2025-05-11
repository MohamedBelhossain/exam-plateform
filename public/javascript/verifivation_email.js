document.addEventListener('DOMContentLoaded', () => {
    // Check if we have a pending email in session storage
    if (!sessionStorage.getItem('pendingEmail')) {
        // Redirect to inscription page if no pending email
        window.location.href = '/principale/inscri';
        return;
    }

    // Set up code input fields
    const codeInputs = document.querySelectorAll('.code-input');
    
    // Auto-focus next input field after entering a digit
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value.length === this.maxLength) {
                if (index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
            }
        });

        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    // Initialize countdown timer (10 minutes)
    let timeLeft = 600;
    const timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            document.querySelector('.timer').innerHTML = `
                <a href="#" id="resend-link">Renvoyer le code</a>
            `;
            document.getElementById('resend-link').addEventListener('click', resendCode);
            clearInterval(timerInterval);
        } else {
            document.getElementById('countdown').textContent = 
                `${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}`;
            timeLeft--;
        }
    }, 1000);

    // Add verification button event listener
    document.querySelector('button').addEventListener('click', verifyCode);

    // Function to show error messages
    function showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide success message if it's showing
        document.getElementById('success-message').style.display = 'none';
        
        // Clear error after 3 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }

    // Function to show success messages
    function showSuccess(message) {
        const successElement = document.getElementById('success-message');
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        // Hide error message if it's showing
        document.getElementById('error-message').style.display = 'none';
    }

    // Function to verify the entered code
    async function verifyCode() {
        // Collect the code from all input fields
        const code = Array.from(codeInputs).map(input => input.value).join('');
        
        if (code.length !== 6) {
            showError('Veuillez entrer le code complet (6 chiffres)');
            return;
        }

        try {
            // UPDATED: Changed endpoint to the new API path
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: sessionStorage.getItem('pendingEmail'),
                    code
                })
            });

            if (response.ok) {
                showSuccess('Email vérifié avec succès!');
                
                // Remove the email from session storage
                sessionStorage.removeItem('pendingEmail');
                
                // Redirect to login page after successful verification
                setTimeout(() => {
                    window.location.href = '/principale/connexion';
                }, 2000);
            } else {
                const data = await response.json();
                showError(data.message || 'Code de vérification incorrect');
            }
        } catch (error) {
            console.error('Error during verification:', error);
            showError('Erreur de connexion au serveur');
        }
    }

    // Function to resend the verification code
    async function resendCode() {
        try {
            // UPDATED: Changed endpoint to the new API path
            const response = await fetch('/api/resend', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: sessionStorage.getItem('pendingEmail')
                })
            });

            if (response.ok) {
                showSuccess('Un nouveau code a été envoyé à votre adresse email');
                
                // Reset the timer
                timeLeft = 600;
                document.querySelector('.timer').innerHTML = 'Temps restant : <span id="countdown">10:00</span>';
                
                // Clear the input fields
                codeInputs.forEach(input => input.value = '');
                codeInputs[0].focus();
            } else {
                const data = await response.json();
                showError(data.message || 'Erreur lors de l\'envoi du code');
            }
        } catch (error) {
            console.error('Error resending code:', error);
            showError('Erreur de connexion au serveur');
        }
    }

    // Make the functions globally available
    window.verifyCode = verifyCode;
    window.resendCode = resendCode;
});