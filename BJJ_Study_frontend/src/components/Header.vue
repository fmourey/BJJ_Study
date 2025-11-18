<template>
    <header class="header">
        <div class="home">Accueil</div>
        <button class="login">Connexion</button>
    </header>
</template>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: white;
    border-bottom: 1px solid #ddd;
}

.login {
    background: black;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.login:hover {
    background: #333;
}

</style>