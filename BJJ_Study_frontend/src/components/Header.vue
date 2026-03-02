<template>
  <header class="header">
    <div class="header-inner">

      <button
        class="btn btn-dark"
        @click="$router.push('/')"
      >
        Home
      </button>

      <div class="auth-buttons">
        <button
          v-if="!isAuthenticated"
          class="btn btn-ghost"
          @click="loginWithRedirect()"
        >
          Login
        </button>

        <button
          v-if="!isAuthenticated"
          class="btn btn-primary"
          @click="loginWithRedirect(signupHint)"
        >
          Sign Up
        </button>

        <button
          v-if="isAuthenticated"
          class="btn btn-ghost"
          @click="$router.push('/myaccount')"
        >
          My Profile
        </button>

        <button
          v-if="isAuthenticated"
          class="btn btn-dark"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>

    </div>
  </header>
</template>

<script setup>
import { useAuth0 } from "@auth0/auth0-vue";
const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
const signupHint = { authorizationParams: { screen_hint: "signup" } };

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: window.location.origin + "/static/"
    }
  });
};
</script>

<style scoped>
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 50px;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}
</style>
