document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('pendingEmail')) {
        window.location.href = 'inscri.html';
    }

    const codeInputs = document.querySelectorAll('.code-input');
    let timeLeft = 600;

    const timerInterval = setInterval(() => {
        if(timeLeft <= 0) {
            document.querySelector('.timer').innerHTML = `
                <a href="#" onclick="resendCode()">Renvoyer le code</a>
            `;
            clearInterval(timerInterval);
        }
        document.getElementById('countdown').textContent = 
            `${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}`;
        timeLeft--;
    }, 1000);

    window.verifyCode = async () => {
        const code = Array.from(codeInputs).map(i => i.value).join('');
        
        if(code.length !== 6) {
            showError('Code incomplet');
            return;
        }

        try {
            const response = await fetch('/verify', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: sessionStorage.getItem('pendingEmail'),
                    code
                })
            });

            if(response.ok) {
                window.location.href = 'config.html';
            } else {
                showError('Code incorrect');
            }
        } catch (error) {
            showError('Erreur de connexion');
        }
    };

    window.resendCode = async () => {
        await fetch('/resend', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: sessionStorage.getItem('pendingEmail')})
        });
        location.reload();
    };
});