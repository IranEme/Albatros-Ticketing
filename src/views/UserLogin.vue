<template>
  <div class="login-view">
    <div id="app-container">
      <div class="card">
        <img src="/loog negro.jpg" alt="Logo Albatros Ticketing" class="login-logo">
        <h2>Iniciar Sesión</h2>
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label for="email">Email</label>
            <input 
              id="email"
              type="email" 
              v-model="email" 
              required
            >
          </div>
          <div class="input-group">
            <label for="password">Contraseña</label>
            <input 
              id="password"
              type="password" 
              v-model="password" 
              required
            >
          </div>
          <button type="submit" :disabled="cargando">
            {{ cargando ? 'Iniciando Sesión...' : 'Entrar' }}
          </button>
        </form>
        <p v-if="errorMsg" class="estado error">{{ errorMsg }}</p>
        <div class="links-container">
          <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
          <router-link to="/register">¿No tienes cuenta? Regístrate</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();
const email = ref('');
const password = ref('');
const cargando = ref(false);
const errorMsg = ref('');

async function handleLogin() {
  cargando.value = true;
  errorMsg.value = '';
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    errorMsg.value = 'Error: ' + error.message;
    cargando.value = false;
    return;
  }

  if (data.user) {
    // --- ADVERTENCIA DE SEGURIDAD: ESTO NO ES SEGURO PARA PRODUCCIÓN ---
    // Para desarrollo local, se permite el acceso de admin si el email coincide.
    // En producción, la verificación de roles debe hacerse en el backend.
    if (data.user.email.trim().toLowerCase() === 'iranmercado6@gmail.com') { // Hardcodeado para admin
      router.push({ name: 'AdminDashboard' });
    } else {
      router.push({ name: 'Home' });
    }
  }
  
  cargando.value = false;
}
</script>

<style scoped>
/* Variables de Color (copiadas de TicketForm) */
:root {
  --background-color: #1a1a1a;
  --card-background: #242424;
  --primary-text-color: #e0e0e0;
  --secondary-text-color: #b3b3b3;
  --accent-color: #00ffff; /* Cyan */
  --accent-color-dark: #00b3b3;
  --border-color: #444;
  --input-background: transparent;
  --error-color: #ff5252;
  --success-color: #4caf50;
}

/* Contenedor principal */
#app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  padding-top: 2rem; /* Vuelve al padding original */
  box-sizing: border-box;
}

.card {
  background: var(--card-background);
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--border-color);
  text-align: center;
}

.login-logo {
  height: 180px; /* Tamaño del logo dentro de la tarjeta, aún más grande */
  margin-bottom: 1.5rem; /* Espacio debajo del logo */
}

h2 {
  text-align: center;
  margin-top: 0; /* Asegura que no haya margen superior extra */
  margin-bottom: 2rem;
  color: var(--primary-text-color);
  font-weight: 600;
}

.input-group {
  position: relative;
  margin-bottom: 2.5rem;
}

.input-group label {
  position: absolute;
  top: -10px;
  left: 10px;
  background: var(--card-background);
  padding: 0 5px;
  font-size: 0.85em;
  color: var(--secondary-text-color);
}

input {
  width: 100%;
  background: var(--input-background);
  color: var(--primary-text-color);
  padding: 14px;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
}

input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px var(--card-background) inset !important;
    -webkit-text-fill-color: var(--primary-text-color) !important;
    transition: background-color 5000s ease-in-out 0s; /* Retrasa la transición del navegador */
}

input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.2);
}

button[type="submit"] {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  border: none;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  background-color: #ffffff;
  color: #121212;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: var(--accent-color);
  color: #ffffff;
  box-shadow: 0 0 15px 3px rgba(0, 255, 255, 0.25);
}

button:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.5;
}

.estado {
  text-align: center;
  margin-top: 15px;
  font-size: 0.9em;
  padding: 12px;
  border-radius: 8px;
}

.estado.error { color: #fff; background-color: var(--error-color); }

.links-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  font-size: 0.9em;
}

.links-container a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.links-container a:hover {
  text-decoration: underline;
  color: var(--accent-color-dark);
}
</style>
