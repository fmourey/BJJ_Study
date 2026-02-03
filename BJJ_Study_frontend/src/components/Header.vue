<template>
    <header class="header">
      <button class="btn home" onclick="window.location.href = '/'">Accueil</button>
        <div class="auth-buttons">
          <button class="btn login" v-if="!isAuthenticated" @click="loginWithRedirect()">
            Login
          </button>
          <button class="btn logout" v-else @click="logout({ logoutParams: { returnTo: window.location.origin } })">
            Logout
          </button>
        </div>
        <button class="btn register" v-if="!isAuthenticated" @click="loginWithRedirect(signupHint)">Inscription</button>
        <button class="btn myaccount" v-if="isAuthenticated" onclick="window.location.href = '#/myaccount'">Mon Profil</button>
    </header>
</template>

<script setup>
import { useAuth0 } from "@auth0/auth0-vue";
const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
const signupHint = { authorizationParams: { screen_hint: "signup" } };
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #ddd;
}
.home {
  background: #222;
  color: white;
}

.home:hover {
  background: #222;
}

.auth-buttons {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.btn {
  width: 160px;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
}

.login {
  background: black;
  color: white;
}

.login:hover {
  background: #222;
}

.register {
  background: #e63946;
  color: white;
}

.register:hover {
  background: #c62836;
}

.myaccount {
  background: black;
  color: white;
}

.myaccount:hover {
  background: #222;
}

.logout {
  background: black;
  color: white;
}

.logout:hover {
  background: #222;
}

</style>
