
## 🧩 **Résumé du Contexte**
Application web destinée :
- Aux **enseignants** : création et gestion d'examens.
- Aux **étudiants** : participation aux examens via des liens uniques.


## 🚀 **Fonctionnalités Clés**

### 🔐 Authentification
- **Inscription** : formulaire avec champs classiques (email, nom, prénom, etc.).
- **Connexion** : vérification des identifiants + gestion de session via **JWT**.

### 🧑‍🏫 Espace Enseignant
- **Création d'examens** : titre, description, public ciblé (filière, niveau…).
- **Ajout de questions** :
  - **QCM** : choix multiples avec bonne(s) réponse(s).
  - **Questions directes** : réponses libres.
  - **Tolérance d’erreurs** : utile pour les réponses textuelles (ex. : Levenshtein distance).
  - **Durée** : temps limite par question ou par examen.
- **Médias** : upload et intégration d’images, audio, vidéo.
- **Lien d’accès unique** : généré automatiquement pour chaque examen.



## 🛠️ **Technologies Utilisées**

| Composant       | Technologie         |
|----------------|---------------------|
| Backend         | Node.js + Express   |
| Frontend        | HTML, CSS, JS (EJS) |
| Base de données | MongoDB             |
| Authentification| JWT                 |



### 🔒 Sécurité
- Hash des mots de passe avec **bcrypt**
- Vérification du token JWT sur les routes protégées
- Limitation d’accès selon le rôle (enseignant vs étudiant)

