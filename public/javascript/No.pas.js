
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const rules = document.querySelectorAll('.rules span');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.querySelector('.strength-text');
const submitBtn = document.querySelector('.btn');
const errorMsg = document.querySelector('.error');
const successMsg = document.querySelector('.success');

const checkPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    
    if (/\d/.test(password)) strength += 1;
    
    if (/[A-Z]/.test(password)) strength += 1;
    
    return strength;
};

const updateStrength = (strength) => {
    const colors = ['#ff4444', '#ffc107', '#00C851'];
    const texts = ['ضعيفة', 'متوسطة', 'قوية'];
    
    strengthBar.style.width = `${(strength / 3) * 100}%`;
    strengthBar.style.backgroundColor = colors[strength - 1];
    strengthText.textContent = texts[strength - 1];
};

const validateRules = (password) => {
    rules.forEach(rule => {
        const text = rule.textContent;
        
        if (text.includes('8')) {
            rule.classList.toggle('valid', password.length >= 8);
        }
        else if (text.includes('chiffre')) {
            rule.classList.toggle('valid', /\d/.test(password));
        }
        else if (text.includes('majuscule')) {
            rule.classList.toggle('valid', /[A-Z]/.test(password));
        }
    });
};

// 5- التحقق من تطابق كلمتي المرور
const checkPasswordMatch = () => {
    const match = passwordInput.value === confirmInput.value;
    confirmInput.style.borderColor = match ? '#00C851' : '#ff4444';
    return match;
};

passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    const strength = checkPasswordStrength(password);
    
    validateRules(password);
    updateStrength(strength);
});

confirmInput.addEventListener('input', checkPasswordMatch);

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    const strength = checkPasswordStrength(passwordInput.value);
    const isValid = [...rules].every(rule => rule.classList.contains('valid'));
    
    if (!isValid || strength < 2) {
        errorMsg.textContent = 'كلمة المرور لا تستوفي الشروط';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (!checkPasswordMatch()) {
        errorMsg.textContent = 'كلمات المرور غير متطابقة';
        errorMsg.style.display = 'block';
        return;
    }
    
 
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الحفظ...';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        successMsg.textContent = 'تم تحديث كلمة المرور بنجاح';
        successMsg.style.display = 'block';
        
        setTimeout(() => {
            passwordInput.value = '';
            confirmInput.value = '';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Valider';
        }, 3000);
        
    } catch (error) {
        errorMsg.textContent = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
        errorMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Valider';
    }
});