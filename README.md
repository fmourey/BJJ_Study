# BJJ Study - Plateforme collaborative de technique de Jiu-Jitsu Brésilien

## Description du projet

### Contexte
BJJ Study est un projet développé par Atlan Naïs, Benzakour Lina et Mourey Florian dans l'option DO IT pendant 1 semestre. L'objectif de ce projet est de créer une **plateforme web collaborative** de référencement et d'apprentissage de techniques de Jiu-Jitsu Brésilien.

### Technologies utilisées

**Backend:**
- **Node.js** et **Express** - Serveur web et API REST
- **SQLite3** - Base de données légère et portable
- **Sequelize** - ORM (Object-Relational Mapping) pour la gestion des données
- **Auth0** - Authentification et gestion des utilisateurs
- **express-oauth2-jwt-bearer** - Validation des tokens JWT
- **Vitest et Supertest** - Tests unitaires et d'intégration

**Frontend:**
- **Vue 3** - Framework JavaScript
- **Vue Router** - Routage côté client
- **Vite** - Bundler et serveur de développement
- **Auth0-Vue** - Intégration Auth0 pour Vue
- **Vitest** - Tests unitaires
- **Playwright** - Tests E2E (End-to-End)

---

## Fonctionnalités principales

Le projet propose les fonctionnalités suivantes :

1. **Uploader une vidéo YouTube** - Les utilisateurs peuvent ajouter des vidéos YouTube avec des informations sur les techniques
2. **Chercher une vidéo avec des filtres** - Recherche par positions de jiu-jitsu, tag et durée.
3. **Lire un extrait vidéo** - Visualiser les vidéos YouTube intégrées
4. **Créer un profil** - Inscription et création d'un profil utilisateur via Auth0
5. **Consulter les profils des autres** - Voir les vidéos publiées et likées par chaque utilisateur
6. **Liker une vidéo** - Marquer ses vidéos préférées
7. **Mettre un commentaire** - Ajouter des commentaires sous les vidéos pour discuter des techniques

---

## Base de données

### Architecture
La base de données utilise **SQLite3** avec **Sequelize** comme ORM (Object-Relational Mapping). Elle gère les relations entre les utilisateurs, vidéos, commentaires et positions.

### Tables principales

| Table | Description |
|-------|-------------|
| **User** | Informations des utilisateurs (id Auth0, profil) |
| **Video** | Métadonnées des vidéos YouTube (titre, URL, propriétaire) |
| **VideoLike** | Relation many-to-many entre utilisateurs et vidéos likées |
| **Comment** | Commentaires des utilisateurs sur les vidéos |
| **Position** | Positions de jiu-jitsu (ex: delariva, spider guard, armbar, etc.) |

### Relations
- **User → Video** : Un utilisateur peut publier plusieurs vidéos (1:N)
- **User → VideoLike** : Un utilisateur peut liker plusieurs vidéos (1:N)
- **Video → VideoLike** : Une vidéo peut être likée par plusieurs utilisateurs (1:N)
- **User → Comment** : Un utilisateur peut écrire plusieurs commentaires (1:N)
- **Video → Comment** : Une vidéo peut avoir plusieurs commentaires (1:N)
- **Video ↔ Position** : Relation many-to-many (une vidéo peut couvrir plusieurs positions)

---

## Installation et lancement

### Prérequis
- **Node.js** >= 22.12.0
- **npm** >= 10
- Un compte **Auth0** configuré

### 1. Clonage du projet
```bash
git clone https://github.com/fmourey/BJJ_Study.git
cd BJJ_Study
```

### 2. Installation des dépendances

**Backend:**
```bash
cd BJJ_Study_backend
npm install
```

**Frontend:**
```bash
cd ../BJJ_Study_frontend
npm install
```

### 3. Configuration des variables d'environnement

#### Backend `.env`
Créez le fichier `BJJ_Study_backend/.env` :
```
NODE_ENV=development
VITE_AUTH0_DOMAIN=<your-auth0-domain>
VITE_AUTH0_AUDIENCE=<your-auth0-api-audience>
VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
```

#### Frontend `.env`
Créez le fichier `BJJ_Study_frontend/.env` :
```
VITE_AUTH0_DOMAIN=<your-auth0-domain>
VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
VITE_AUTH0_REDIRECT_URI=http://localhost:5173/callback
```

### 4. Lancement du serveur

**Backend** (fonctionnera sur `http://localhost:1025`):
```bash
cd BJJ_Study_backend
npm start
```

**Frontend** (fonctionnera sur `http://localhost:5173`):
```bash
cd BJJ_Study_frontend
npm run dev
```

Le frontend communiquera avec le backend via les variables d'environnement configurées dans `src/config/api.js`.

---

## Authentification avec Auth0

### Intégration
L'authentification est gérée par **Auth0**, une plateforme de gestion d'identité sécurisée. Elle permet une connexion sans mots de passe stockés localement.

### Fonctionnement
1. L'utilisateur clique sur "Se connecter"
2. Il est redirigé vers Auth0
3. Après authentification réussie, Auth0 délivre un **JWT (JSON Web Token)**
4. Le token est stocké et envoyé avec chaque requête au backend
5. Le backend valide le token via `express-oauth2-jwt-bearer`
6. Un profil utilisateur est créé dans la table `User` s'il n'existe pas

### Variables d'environnement Auth0
- `VITE_AUTH0_DOMAIN` - Domaine Auth0 (ex: `example.auth0.com`)
- `VITE_AUTH0_CLIENT_ID` - ID client de l'application Auth0
- `VITE_AUTH0_AUDIENCE` - Audience de votre API Auth0
- `VITE_AUTH0_REDIRECT_URI` - URL de redirection après connexion

### Configuration Auth0
Pour plus d'informations sur la configuration d'Auth0 :
- [Documentation Auth0 - Vue 3](https://auth0.com/docs/quickstart/spa/vuejs)
- [Fiche technique - Auth0](/Auth0_fiche_technique.md)

---

## Tests

### Couverture de tests
Le projet utilise **Vitest** pour les tests unitaires et **Playwright** pour les tests E2E :

- **Composants Vue** - Tests unitaires des composants
- **Hooks/Composables** - Tests des logiques réutilisables
- **API Backend** - Tests d'intégration avec Supertest
- **Fluxes utilisateur** - Tests E2E avec Playwright

### Lancement des tests

**Backend - Tests unitaires & d'intégration:**
```bash
cd BJJ_Study_backend
npx vitest
```

**Frontend - Tests unitaires:**
```bash
cd BJJ_Study_frontend
npx vitest run
```

**Frontend - Tests E2E (Playwright):**
```bash
cd BJJ_Study_frontend
npm run test:e2e
```

### Couverture de code
Pour générer un rapport de couverture :

**Backend:**
```bash
cd BJJ_Study_backend
npx vitest --coverage
```

**Frontend:**
```bash
cd BJJ_Study_frontend
npx vitest --coverage
```

---

## Déploiement

### Script de déploiement
Le projet utilise un script **bash** (`deploy.sh`) pour automatiser le déploiement sur le serveur de l'école.

### Processus de déploiement

```bash
./deploy.sh
```

Le script effectue les opérations suivantes :

1. **Sauvegarde de la base de données** - Crée un backup de `videos.db` avant toute modification
2. **Clonage du projet** - Récupère la dernière version depuis GitHub
3. **Configuration** - Copie les fichiers `.env` depuis le répertoire local
4. **Préparation du backend**:
   - Suppression des `node_modules` existants
   - Modification du port (par défaut 1025)
5. **Préparation du frontend**:
   - Modification de l'URL de l'API pour pointer sur le serveur de production
6. **Build**:
   - Installation des dépendances avec `npm install`
   - Build optimisé avec `npm run build`
7. **Upload des fichiers** via SCP
8. **Restauration de la base de données** - Les anciennes données sont préservées

### Serveur de production
- **Hôte:** `laurier@aioli.ec-m.fr`
- **Port backend:** `1025`
- **URL de production:** `https://laurier.aioli.ec-m.fr/static/#/`
- **Authentification SSH:** Via jumphost `sas1.ec-m.fr`

### Préservation des données
**Important:** Le script préserve automatiquement la base de données SQLite (`videos.db`) lors du déploiement. Aucune perte de données n'occupe lors d'une mise à jour.

### Structure du déploiement
```
Serveur:
├── BJJ_Study_backend/   # Code backend et vidéos.db
└── static/              # Frontend compilé
```

---


**Auteurs : Atlan Naïs - Benzakour Lina - Mourey Florian**

**Encadrant : Brucker François**

*Dernière mise à jour: Mars 2026*
