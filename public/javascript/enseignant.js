document.addEventListener("DOMContentLoaded", () => {
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
                showSection("dashboard"); // Redirect to the default section
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
});

document.getElementById('form-examen').addEventListener('submit', async (event) => {
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
    } else {
        alert(data.message || 'Erreur lors de la création de l\'examen');
    }
});


const toggle = document.getElementById('nom-enseignant');
  const menu = document.getElementById('dropdownMenu');

  toggle.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  
  window.addEventListener('click', function(e) {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  
  document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/enseignant/examens');
        const exams = await response.json();

        const listeExamens = document.getElementById("liste-examens");

        if (Array.isArray(exams) && exams.length > 0) {
            exams.forEach(exam => {
                const examElement = document.createElement("div");
                examElement.classList.add("examen");

                examElement.innerHTML = `
                    <h3>${exam.titre}</h3>
                    <p>${exam.description}</p>
                    <p><strong>Public Ciblé:</strong> ${exam.public}</p>
                    <a href="${exam.lien}" target="_blank">Accéder à l'examen</a>
                `;

                listeExamens.appendChild(examElement);
            });
        } else {
            listeExamens.innerHTML = '<p>Aucun examen trouvé.</p>';
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des examens:", error);
        document.getElementById("liste-examens").innerHTML = '<p>Erreur lors de la récupération des examens.</p>';
    }
});
  toggle.textContent = nomEnseignant + ' ⌄';
  document.getElementById('recherche-examen').addEventListener('input', (event) => {
    const searchQuery = event.target.value.toLowerCase();
    const exams = document.querySelectorAll('.examen');
    exams.forEach(exam => {
        const title = exam.querySelector('h3').innerText.toLowerCase();
        if (title.includes(searchQuery)) {
            exam.style.display = 'block';
        } else {
            exam.style.display = 'none';
        }
    });
});
  

 