document.addEventListener("DOMContentLoaded", () => {
    // Code de navigation existant
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    if (!sections.length || !navLinks.length) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    function showSection(sectionId) {
        sections.forEach(section => {
            section.style.display = "none";
        });
    
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            if (targetSection.innerHTML.trim() === "") {
                console.warn(`Section "${sectionId}" is empty. Redirecting to the default section.`);
                showSection("dashboard"); 
                return;
            }
    
            targetSection.style.display = "block";
        }
    
        navLinks.forEach(link => {
            link.classList.remove("active");
            const href = link.getAttribute("href");
            if (href === `#${sectionId}`) {
                link.classList.add("active");
            }
        });
    
        localStorage.setItem("activeSection", sectionId);
    }

    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute("href").substring(1);
            showSection(sectionId);
        });
    });

    const savedSection = localStorage.getItem("activeSection");
    const defaultSection = "dashboard";

    if (savedSection && document.getElementById(savedSection)) {
        showSection(savedSection);
    } else {
        console.warn(`Section with ID "${savedSection || defaultSection}" not found. Showing the default section.`);
        if (document.getElementById(defaultSection)) {
            showSection(defaultSection);
        } else if (sections.length) {
            showSection(sections[0].id);
        }
    }

    // Gérer le formulaire d'examen
    const formExamen = document.getElementById('form-examen');
    if (formExamen) {
        formExamen.addEventListener('submit', async (event) => {
            event.preventDefault();

            const titre = document.getElementById('titre').value;
            const description = document.getElementById('description').value;
            const publicCible = document.getElementById('public').value;

            const response = await fetch('/enseignant/create-exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titre,
                    description,
                    publicCible
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Examen créé avec succès!');
                // Recharger les examens après la création
                fetchExams();
            } else {
                alert(data.message || 'Erreur lors de la création de l\'examen');
            }
        });
    } else {
        console.warn("Le formulaire d'examen n'a pas été trouvé dans le DOM.");
    }

    // Gestion du menu déroulant
    const toggle = document.getElementById('nom-enseignant');
    const menu = document.getElementById('dropdownMenu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
        
        window.addEventListener('click', function(e) {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.style.display = 'none';
            }
        });
    } else {
        console.warn("Les éléments du menu déroulant n'ont pas été trouvés dans le DOM.");
    }

    // Gestion de la liste des examens
    const listeExamens = document.getElementById("liste-examens");
    const champRecherche = document.getElementById("recherche-examen");
    
    if (listeExamens) {
        let examens = [];

        // Fonction pour créer la carte d'un examen
        const createExamCard = (exam) => {
            return `
            <div class="exam-card">
                <h3>${exam.titre}</h3>
                <p><strong>Description :</strong> ${exam.description}</p>
                <p><strong>Public ciblé :</strong> ${exam.public}</p>
                <a href="${exam.lienAcces}" class="exam-link" target="_blank">Accéder à l'examen</a>
            </div>`;
        };

        // Fonction pour afficher les examens dans le DOM
        const afficherExamens = (examensFiltrés) => {
            listeExamens.innerHTML = examensFiltrés.length > 0 
                ? examensFiltrés.map(createExamCard).join("")
                : "<p>Aucun examen trouvé.</p>";
        };

        fetch("/enseignant/examens")
            .then(response => response.json())
            .then(data => {
                examens = data;
                afficherExamens(examens);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des examens :", error);
                listeExamens.innerHTML = `<p style="color: red;">Erreur lors du chargement des examens.</p>`;
            });

        // Événement de recherche
        if (champRecherche) {
            champRecherche.addEventListener("input", () => {
                const recherche = champRecherche.value.toLowerCase();
                const examensFiltrés = examens.filter(exam =>
                    exam.titre.toLowerCase().includes(recherche)
                );
                afficherExamens(examensFiltrés);
            });
        } else {
            console.warn("Le champ de recherche n'a pas été trouvé dans le DOM.");
        }
    } else {
        console.warn("La liste des examens n'a pas été trouvée dans le DOM.");
    }

    // Fonction pour récupérer et afficher les examens dans le dashboard
    function fetchExams() {
        fetch("/enseignant/examens") 
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur de réponse du serveur');
                }
                return response.json();
            })
            .then(exams => {
                const nbExamsElement = document.getElementById("nb-examens");
                const activityListElement = document.getElementById("liste-activites");

                if (nbExamsElement) {
                    // Mettre à jour le nombre d'examens créés
                    nbExamsElement.textContent = exams.length;
                } else {
                    console.warn("L'élément 'nb-examens' n'a pas été trouvé dans le DOM.");
                }

                if (activityListElement) {
                    // Effacer les activités précédentes
                    activityListElement.innerHTML = '';

                    // Afficher chaque examen dans la section "Activité récente"
                    if (exams.length > 0) {
                        exams.forEach(exam => {
                            const li = document.createElement("li");
                            li.textContent = `${exam.titre} - ${exam.description}`;
                            activityListElement.appendChild(li);
                        });
                    } else {
                        activityListElement.innerHTML = '<li>Aucune activité récente</li>';
                    }
                } else {
                    console.warn("L'élément 'liste-activites' n'a pas été trouvé dans le DOM.");
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des examens:', error);
                
                const nbExamsElement = document.getElementById("nb-examens");
                const activityListElement = document.getElementById("liste-activites");
                
                if (nbExamsElement) {
                    nbExamsElement.textContent = "Erreur";
                }
                
                if (activityListElement) {
                    activityListElement.innerHTML = '<li style="color: red;">Erreur lors du chargement des activités</li>';
                }
            });
    }

    // Appeler fetchExams au chargement de la page pour charger les données du dashboard
    fetchExams();
});
  

 