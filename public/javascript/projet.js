document.addEventListener('DOMContentLoaded', () => {
    let questions = [];
    let currentQuestion = 0;
    let score = 0;
    let timeLeft = 60;
    let timer;
    let userLocation = null;

    const startBtn = document.getElementById('start-btn');
    const locationBtn = document.getElementById('location-btn');
    const nextBtn = document.getElementById('next-btn');
    const locationStatus = document.getElementById('location-status');
    const resultsStatus = document.getElementById('results-status');

    const userId = 'etudiant1';

    // Démarrer l'examen
    startBtn.addEventListener('click', () => {
        document.getElementById('start-section').classList.add('hidden');
        document.getElementById('geolocation-section').classList.remove('hidden');
    });

    // Géolocalisation
    locationBtn.addEventListener('click', async() => {
        if (!navigator.geolocation) {
            locationStatus.textContent = "Géolocalisation non supportée.";
            return;
        }

        locationBtn.disabled = true;
        locationBtn.textContent = "Détection en cours...";
        locationStatus.textContent = "";

        navigator.geolocation.getCurrentPosition(
            async(position) => {
                userLocation = {
                    lat: position.coords.latitude.toFixed(4),
                    lng: position.coords.longitude.toFixed(4)
                };

                try {
                    await fetch('/api/etudiant/location', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId,
                            latitude: userLocation.lat,
                            longitude: userLocation.lng
                        })
                    });

                    locationStatus.textContent = `Localisation enregistrée : ${userLocation.lat}, ${userLocation.lng}`;
                    locationStatus.classList.add('success');

                    setTimeout(() => {
                        document.getElementById('geolocation-section').classList.add('hidden');
                        document.getElementById('exam-section').classList.remove('hidden');
                        startTimer();
                        loadQuestion();
                    }, 1500);
                } catch (error) {
                    locationStatus.textContent = "Erreur lors de l'enregistrement de la localisation.";
                    locationBtn.disabled = false;
                    locationBtn.textContent = "Réessayer";
                    console.error(error);
                }
            },
            (error) => {
                locationStatus.textContent = "Erreur : " + (
                    error.code === error.PERMISSION_DENIED ?
                    "Vous devez autoriser la localisation." :
                    "Impossible de vous localiser."
                );
                locationBtn.disabled = false;
                locationBtn.textContent = "Réessayer";
            }
        );
    });


    async function fetchQuestions() {
        try {
            const response = await fetch('/api/etudiant/questions');
            const data = await response.json();
            questions = data;
        } catch (error) {
            console.error('Erreur lors du chargement des questions:', error);
        }
    }


    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('time').textContent =
                `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeLeft <= 0) endExam();
        }, 1000);
    }

    function loadQuestion() {
        const question = questions[currentQuestion];
        document.getElementById('question-text').textContent = question.question;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.classList.add('option-btn');
            btn.addEventListener('click', () => {
                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                nextBtn.disabled = false;
            });
            optionsContainer.appendChild(btn);
        });

        nextBtn.disabled = true;
    }

    nextBtn.addEventListener('click', () => {
        const selectedBtn = document.querySelector('.option-btn.selected');
        if (!selectedBtn) return;

        const userAnswer = Array.from(document.querySelectorAll('.option-btn')).indexOf(selectedBtn);
        if (userAnswer === questions[currentQuestion].correct) {
            score += Math.floor(100 / questions.length);
        }

        currentQuestion++;
        if (currentQuestion < questions.length) {
            loadQuestion();
        } else {
            endExam();
        }
    });

    function endExam() {
        clearInterval(timer);
        document.getElementById('exam-section').classList.add('hidden');
        document.getElementById('results-section').classList.remove('hidden');
        document.getElementById('score').textContent = score;
        fetch('/api/etudiant/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    score
                })
            })
            .then(response => response.json())
            .then(data => {
                resultsStatus.textContent = "Résultats enregistrés avec succès !";
                console.log("Score enregistré :", data);
            })
            .catch(error => {
                resultsStatus.textContent = "Erreur lors de l'enregistrement du score.";
                console.error("Erreur score :", error);
            });
    }
    fetchQuestions();
});