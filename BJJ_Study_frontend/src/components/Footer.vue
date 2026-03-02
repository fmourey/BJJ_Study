<template>
  <footer class="footer">
    <div class="container footer-inner">

      <div class="footer-col">
        <h3>BJJ Study</h3>
        <p>
          Plateform of analysis and progression dedicated to Brazilian Jiu-Jitsu practitioners
          of all levels.
        </p>
      </div>

      <div class="footer-col">
        <h3>Navigation</h3>
        <ul class="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/#/addvideo">Add a video</a></li>
          <li><a href="/#/myaccount">My profile</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h3>Legal informations</h3>
        <ul class="footer-links">
          <li><a href="#">Legal notices</a></li>
          <li><a href="#">Privacy policy</a></li>
          <li><a href="#">General terms of use</a></li>
          <li><a href="#">Cookie management</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h3>Contact</h3>
        <div class="footer-links">
          <p>Email : contact@bjjstudy.com</p>
          <p>Support : support@bjjstudy.com</p>
        </div>
      </div>

    </div>

    <div class="footer-bottom">
      © {{ new Date().getFullYear() }} BJJ Study — All rights reserved.
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: var(--surface);
  border-top: 1px solid var(--line);
  margin-top: 60px;
}

.footer-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  padding-top: 40px;
  padding-bottom: 40px;
}

.footer-col h3 {
  font-size: 14px;
  margin-bottom: 12px;
}

.footer-col p {
  font-size: 14px;
  color: var(--muted);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links a {
  font-size: 14px;
  color: var(--muted);
  transition: color .2s ease;
}

.footer-links a:hover {
  color: var(--brand);
}

.footer-bottom {
  text-align: center;
  padding: 18px;
  font-size: 13px;
  color: var(--muted);
  border-top: 1px solid var(--line);
}

@media (max-width: 640px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
