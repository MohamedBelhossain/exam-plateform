const typeSelect = document.getElementById('type');
const qcmFields = document.getElementById('qcm-fields');
const directeFields = document.getElementById('directe-fields');
const choixContainer = document.getElementById('choix-container');
const addChoixBtn = document.getElementById('add-choix-btn');
const bonneReponseSelect = document.getElementById('bonneReponse');
const bonneReponseDirecte = document.getElementById('bonneReponseDirecte');
const toleranceInput = document.getElementById('tolerance');
const toleranceDisplay = document.getElementById('tolerance-percentage');
const questionIdInput = document.getElementById('questionId');
const addButton = document.getElementById('add-button');
const cancelEditButton = document.getElementById('cancel-edit');
const form = document.querySelector('form');
const examUuid = document.querySelector('form').dataset.examUuid;

toleranceInput.addEventListener('input', () => {
    const toleranceValue = toleranceInput.value;
    toleranceDisplay.textContent = `${toleranceValue}%`;
});

document.addEventListener('DOMContentLoaded', () => {
    toggleQuestionFields();
    updateBonneReponseOptions();
});

typeSelect.addEventListener('change', () => {
    toggleQuestionFields();
});

function toggleQuestionFields() {
    const isQcm = typeSelect.value === 'qcm';
    qcmFields.style.display = isQcm ? 'block' : 'none';
    directeFields.style.display = isQcm ? 'none' : 'block';

    if (isQcm) {
        bonneReponseDirecte.value = '';
    } else {
        bonneReponseSelect.innerHTML = '<option value="">Sélectionnez la bonne réponse</option>';
    }
}

addChoixBtn.addEventListener('click', () => {
    const choixInputs = choixContainer.querySelectorAll('input');
    const choixCount = choixInputs.length;

    const lastInput = choixInputs[choixCount - 1];
    if (lastInput && lastInput.value.trim() === '') {
        alert("Veuillez remplir le choix précédent avant d'en ajouter un nouveau.");
        return;
    }

    const div = document.createElement('div');
    div.className = 'choix-input';
    div.innerHTML = `
        <input type="text" name="choix[]" placeholder="Choix ${choixCount + 1}" class="form-control">
        <button type="button" class="btn-remove" onclick="removeChoix(this)">X</button>
    `;
    choixContainer.appendChild(div);
    updateBonneReponseOptions();
});

function removeChoix(button) {
    if (choixContainer.children.length <= 2) {
        alert("Une question QCM doit avoir au moins 2 choix.");
        return;
    }
    button.parentElement.remove();
    updateBonneReponseOptions();
}

function updateBonneReponseOptions() {
    const choixInputs = choixContainer.querySelectorAll('input');
    bonneReponseSelect.innerHTML = '<option value="">Sélectionnez la bonne réponse</option>';
    
    choixInputs.forEach((input, index) => {
        if (input.value.trim() !== '') {
            const option = document.createElement('option');
            option.value = input.value;
            option.textContent = input.value;
            bonneReponseSelect.appendChild(option);
        }
    });
}

// Fonction pour préremplir le formulaire avec les données d'une question existante
function editQuestion(questionId) {
    console.log(`Edit question triggered for ID: ${questionId}`);
    
    // Reset form first
    resetForm();
    
    // Trouver la question dans le DOM
    const questionItem = document.querySelector(`.question-item[data-id="${questionId}"]`);
    if (!questionItem) {
        console.error(`Question item with ID ${questionId} not found`);
        return;
    }
    
    // Récupérer les données de la question
    const questionHeader = questionItem.querySelector('.question-header');
    const enonceText = questionHeader.innerHTML.split('</strong>')[1].split('<span')[0].trim();
    const type = questionItem.querySelector('.question-meta').innerText.includes('QCM') ? 'qcm' : 'directe';
    
    console.log(`Question type: ${type}, Enonce: ${enonceText.substring(0, 30)}...`);
    
    // Extraction des points et durée avec regex
    const metaText = questionItem.querySelector('.question-meta').innerText;
    const pointsMatch = metaText.match(/(\d+) points/);
    const dureeMatch = metaText.match(/(\d+) secondes/);
    
    const points = pointsMatch ? parseInt(pointsMatch[1]) : 1;
    const duree = dureeMatch ? parseInt(dureeMatch[1]) : 60;
    
    console.log(`Points: ${points}, Durée: ${duree}`);
    
    // Remplir le formulaire
    document.getElementById('enonce').value = enonceText;
    document.getElementById('type').value = type;
    document.getElementById('points').value = points;
    document.getElementById('duree').value = duree;
    
    if (type === 'qcm') {
        // Récupérer les choix
        const choixElements = questionItem.querySelectorAll('.choix-list li');
        console.log(`Found ${choixElements.length} choices for QCM question`);
        
        // Vider le conteneur de choix actuel
        choixContainer.innerHTML = '';
        
        // Ajouter chaque choix
        choixElements.forEach((choixEl, index) => {
            const choixText = choixEl.innerText.replace('✓', '').trim();
            const isCorrect = choixEl.classList.contains('correct-answer');
            
            console.log(`Choice ${index + 1}: ${choixText} (correct: ${isCorrect})`);
            
            const div = document.createElement('div');
            div.className = 'choix-input';
            div.innerHTML = `
                <input type="text" name="choix[]" value="${choixText}" class="form-control">
                <button type="button" class="btn-remove" onclick="removeChoix(this)">X</button>
            `;
            choixContainer.appendChild(div);
            
            // Si c'est la bonne réponse, on la sélectionnera plus tard
            if (isCorrect) {
                setTimeout(() => {
                    updateBonneReponseOptions();
                    bonneReponseSelect.value = choixText;
                    console.log(`Set correct answer to: ${choixText}`);
                }, 100);
            }
        });
    } else {
        // Question directe
        const bonneReponseEl = questionItem.querySelector('.direct-answer');
        const bonneReponse = bonneReponseEl ? bonneReponseEl.innerText.replace('Réponse attendue :', '').trim() : '';
        
        const toleranceEl = questionItem.querySelector('.tolerance');
        const toleranceMatch = toleranceEl ? toleranceEl.innerText.match(/(\d+)%/) : null;
        const tolerance = toleranceMatch ? parseInt(toleranceMatch[1]) : 0;
        
        console.log(`Direct question answer: ${bonneReponse}, tolerance: ${tolerance}%`);
        
        bonneReponseDirecte.value = bonneReponse;
        toleranceInput.value = tolerance;
        toleranceDisplay.textContent = `${tolerance}%`;
    }
    
    // Mettre à jour l'affichage des champs selon le type
    toggleQuestionFields();
    
    // Changer le formulaire en mode édition
    questionIdInput.value = questionId;
    addButton.textContent = 'Mettre à jour la question';
    cancelEditButton.style.display = 'block';
    
    // Changer l'action du formulaire pour update
    const formAction = `/enseignant/examens/${examUuid}/update-question/${questionId}`;
    console.log(`Setting form action to: ${formAction}`);
    form.setAttribute('action', formAction);
    
    // Ajouter un champ caché pour indiquer que c'est une mise à jour (pour le traitement côté serveur)
    let methodField = form.querySelector('input[name="_method"]');
    if (!methodField) {
        methodField = document.createElement('input');
        methodField.type = 'hidden';
        methodField.name = '_method';
        form.appendChild(methodField);
    }
    methodField.value = 'PUT';
    console.log('Added _method=PUT field to form');
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
    console.log('Form prepared for question update');
}

// Fonction pour supprimer une question
function deleteQuestion(questionId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
        // Créer un formulaire temporaire pour envoyer la requête DELETE
        const deleteForm = document.createElement('form');
        deleteForm.method = 'POST';
        deleteForm.action = `/enseignant/examens/${examUuid}/delete-question/${questionId}`;
        
        // Ajouter un champ caché pour indiquer que c'est une suppression
        const methodField = document.createElement('input');
        methodField.type = 'hidden';
        methodField.name = '_method';
        methodField.value = 'DELETE';
        deleteForm.appendChild(methodField);
        
        // S'assurer que l'enctype est correct
        deleteForm.setAttribute('enctype', 'application/x-www-form-urlencoded');
        
        // Ajouter le formulaire au document et le soumettre
        document.body.appendChild(deleteForm);
        
        // Log pour debug
        console.log('Formulaire de suppression soumis:', deleteForm);
        
        // Soumettre le formulaire et attendre que la suppression soit traitée
        deleteForm.submit();
        
        // Empêcher les clics multiples
        return false;
    }
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
    form.reset();
    questionIdInput.value = '';
    addButton.textContent = 'Ajouter la question';
    cancelEditButton.style.display = 'none';
    form.setAttribute('method', 'POST');
    form.setAttribute('action', `/enseignant/examens/${examUuid}/add-questions`);
    
    // Supprimer le champ _method s'il existe
    const methodField = form.querySelector('input[name="_method"]');
    if (methodField) methodField.remove();
    
    // Réinitialiser les choix pour les QCM
    choixContainer.innerHTML = `
        <div class="choix-input">
            <input type="text" name="choix[]" placeholder="Choix 1" class="form-control">
            <button type="button" class="btn-remove" onclick="removeChoix(this)">X</button>
        </div>
        <div class="choix-input">
            <input type="text" name="choix[]" placeholder="Choix 2" class="form-control">
            <button type="button" class="btn-remove" onclick="removeChoix(this)">X</button>
        </div>
    `;
    
    // Mettre à jour les options de bonne réponse
    updateBonneReponseOptions();
}

// Gestionnaire pour le bouton annuler
cancelEditButton.addEventListener('click', resetForm);

// Validation du formulaire avant soumission
form.addEventListener('submit', (event) => {
    const isQcm = typeSelect.value === 'qcm';
    
    if (isQcm) {
        const choixInputs = choixContainer.querySelectorAll('input');
        const nonEmptyChoices = Array.from(choixInputs).filter(input => input.value.trim() !== '');

        if (nonEmptyChoices.length < 2) {
            event.preventDefault();
            alert("Une question QCM doit comporter au moins 2 choix.");
        }

        if (!bonneReponseSelect.value) {
            event.preventDefault();
            alert("Veuillez sélectionner la bonne réponse.");
        }
    } else {
        if (!bonneReponseDirecte.value.trim()) {
            event.preventDefault();
            alert("Veuillez entrer la réponse correcte.");
        }
        if (toleranceInput.value < 0) {
            event.preventDefault();
            alert("La tolérance doit être positive.");
        }
    }
});

// Mettre à jour dynamiquement les options de bonne réponse lorsque les choix changent
choixContainer.addEventListener('input', updateBonneReponseOptions);