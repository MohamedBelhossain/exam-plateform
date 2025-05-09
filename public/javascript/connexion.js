
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

// 5- وظيفة عرض الأخطاء
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
    btn.textContent = 'تم الدخول بنجاح ✓';
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