<template>
  <div class="login-container">
    <div class="card">
      <h2>👤 Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin">
        <input 
          type="email" 
          v-model="email" 
          placeholder="Email"
          required
        >
        <input 
          type="password" 
          v-model="password" 
          placeholder="Contraseña"
          required
        >
        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Iniciando Sesión...' : 'Entrar' }}
        </button>
      </form>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <p class="register-link">
        ¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link>
      </p>
      <p class="forgot-password-link">
        <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
      </p>
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.card {
  background: #333;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  width: 320px;
  text-align: center;
}
input, button {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  box-sizing: border-box;
  border-radius: 5px;
  border: none;
  font-size: 1em;
}
input {
  background: #444;
  color: white;
}
button {
  background: #007bff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
button:disabled {
  background: #555;
  cursor: not-allowed;
}
.error-msg {
  color: #ff5252;
  margin-top: 10px;
}
.register-link {
  margin-top: 1rem;
  font-size: 0.9em;
}
.register-link a {
  color: #00aaff;
  text-decoration: none;
}
</style>
