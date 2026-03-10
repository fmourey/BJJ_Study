# Fiche technique — Auth0

## 1. Présentation d’Auth0

Auth0 est une plateforme d’**Identity & Access Management (IAM)** qui permet d’ajouter facilement un système d’authentification et d’autorisation dans une application.

Elle permet notamment l’authentification des utilisateurs (login / signup), la gestion des identités (email, Google, GitHub, etc.), la gestion des tokens d’accès, la sécurisation d’API et la gestion des rôles et permissions. La version gratuite est assez étendue et permet jusqu'à 25 000 utilisateurs actifs. 

Cette plateforme permet une meilleure sécurité, de déléguer en partie l'authentification et la gestion des mots de passe. Elle propose également une intégration facile avec la plupart des frameworks de développement web. 

---

## 2. Principe de fonctionnement

Auth0 repose sur les standards OAuth 2.0, OpenID Connect et JSON Web Token (JWT).

Le fonctionnement général est le suivant :

1. L’utilisateur clique sur login.
2. Il est redirigé vers Auth0.
3. Auth0 authentifie l’utilisateur.
4. Auth0 renvoie un **Access Token (JWT)** à l’application.
5. Le frontend utilise ce token pour appeler l’API.
6. Le backend vérifie la validité du token.

---

## 3. Intégration dans le frontend (Vue.js)

Dans notre projet 3A (voir [BJJ Study](https://github.com/fmourey/BJJ_Study)), Auth0 est intégré avec le SDK officiel :

```
@auth0/auth0-vue
```

Installation :

```bash
npm install @auth0/auth0-vue
```

## Configuration Auth0

Dans `main.js`, l’application est configurée avec les paramètres suivants :

```javascript
createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin + "/static/",
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  },
  cacheLocation: "localstorage",
  useRefreshTokens: true
})
```

### Explication des paramètres

Les paramètres sont définis dans un .env et récupérés depuis l'interface web Auth0. Pour un site web, on aura besoin de : 
- domaine Auth0
- identifiant de l'application
- identifiant de l’API protégée (audience)

Sur la plateforme, il faudra également définir l'URL de redirection après login, le stockage du token et le temps de renouvellement des tokens. 

Aller dans Applications>Applications puis créer l'application avec Create single page application. Ensuite, cliquer sur Settings et configurer ainsi : 
![alt text](/screenshots-auth0/image-4.png)
![alt text](/screenshots-auth0/image-1.png)
![alt text](/screenshots-auth0/image-3.png)

### Protection des routes frontend

Les routes nécessitant une authentification sont protégées avec **authGuard**.

Exemple :

```javascript
{
  path: '/addvideo',
  name: 'add-video',
  component: AddVideoView,
  beforeEnter: authGuard
}
```

Cela signifie que l’utilisateur doit être connecté pour accéder à la page. Sinon il est redirigé vers la page de login Auth0.

### Récupération du token côté frontend

Lorsqu’un utilisateur est connecté, le frontend peut récupérer un **Access Token**.

Exemple dans le code :

```javascript
const { getAccessTokenSilently } = useAuth0()

const token = await getAccessTokenSilently()
```

Ce token est ensuite envoyé dans les requêtes API :

```javascript
fetch("/api/videos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }
})
```

Le header HTTP devient :

```
Authorization: Bearer <JWT>
```

---

## 4. Sécurisation de l’API backend (Express)

Côté serveur, l’API est protégée grâce au middleware :

```
express-oauth2-jwt-bearer
```

Installation :

```bash
npm install express-oauth2-jwt-bearer
```

### Middleware de vérification JWT

Dans le backend :

```javascript
const checkJwt = auth({
  audience: process.env.VITE_AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.VITE_AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});
```

Ce middleware vérifie la signature du JWT, le domaine Auth0 et l’audience.

### Protection d’une route API

Exemple :

```javascript
app.post("/api/videos", checkJwt, async (req, res) => {
```

La route devient accessible uniquement si le token est valide.

### Identification de l’utilisateur

Le token JWT contient des informations sur l’utilisateur.

On peut les récupérer avec :

```javascript
req.auth.payload
```

Exemple dans le projet :

```javascript
const owner_auth0_id = req.auth.payload.sub
```

Le champ `sub` correspond à l’identifiant unique de l’utilisateur Auth0.

Exemple :

```
auth0|65fa0d234ab123456789
```

Cet identifiant est ensuite utilisé dans la base de données.

Dans notre projet par exemple, les utilisateurs sont enregistrés dans la base avec leur Auth0 ID comme clef primaire. Cela permet de lier les vidéos, les commentaires et les likes à un utilisateur Auth0.

---

**Authors** : 
Florian Mourey -
Naïs Atlan -
Lina Benzakour
