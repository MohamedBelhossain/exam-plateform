

document.querySelector('button').addEventListener('click', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const button = e.currentTarget;
    const loader = button.querySelector('.loader');
    const successMessage = document.getElementById('successMessage');

 
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    if (!emailRegex.test(emailInput.value)) {
        showError('البريد الإلكتروني غير صحيح', emailInput);
        return;
    }

  
    button.disabled = true;
    loader.style.display = 'block';
    button.querySelector('.btn-text').style.opacity = '0';

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        successMessage.style.display = 'block';
        successMessage.style.animation = 'fadeIn 0.5s ease';
        
        setTimeout(() => {
            emailInput.value = '';
            loader.style.display = 'none';
            button.querySelector('.btn-text').style.opacity = '1';
            button.disabled = false;
            successMessage.style.display = 'none';
        }, 3000);

    } catch (error) {
        showError('حدث خطأ في الإرسال، يرجى المحاولة لاحقاً', emailInput);
        loader.style.display = 'none';
        button.querySelector('.btn-text').style.opacity = '1';
        button.disabled = false;
    }
});

function showError(message, input) {
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

    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) existingError.remove();

    input.parentNode.appendChild(errorElement);
    input.style.borderColor = '#ff4444';
    
    setTimeout(() => {
        errorElement.remove();
        input.style.borderColor = '#fff';
    }, 3000);
}

document.getElementById('email').addEventListener('input', function() {
    const label = this.parentNode.querySelector('label');
    if (this.value.trim() !== '') {
        label.style.color = '#fff';
        label.style.textShadow = '0 0 8px rgba(255,255,255,0.5)';
    } else {
        label.style.color = '#fff';
        label.style.textShadow = 'none';
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
    }
`;
document.head.appendChild(style);