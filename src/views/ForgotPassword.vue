<template>
  <div class="forgot-password-container">
    <div class="card">
      <h2>🔒 Recuperar Contraseña</h2>
      <form @submit.prevent="handlePasswordReset">
        <p>Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
        <input 
          type="email" 
          v-model="email" 
          placeholder="Tu Email"
          required
        >
        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Enviando Enlace...' : 'Enviar Enlace de Recuperación' }}
        </button>
      </form>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
      <p class="login-link">
        <router-link to="/login">Volver al Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../supabase';

const email = ref('');
const cargando = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

async function handlePasswordReset() {
  cargando.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: window.location.origin + '/update-password', // URL a la que Supabase redirigirá después de hacer clic en el enlace del correo
    });

    if (error) {
      throw error;
    }

    successMsg.value = '¡Enlace de recuperación enviado! Revisa tu correo electrónico (y la carpeta de spam).';
    email.value = ''; // Limpiar el campo
  } catch (error) {
    errorMsg.value = 'Error: ' + error.message;
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.forgot-password-container {
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
  width: 360px;
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
.success-msg {
  color: #4caf50;
  margin-top: 10px;
}
.login-link {
  margin-top: 1rem;
  font-size: 0.9em;
}
.login-link a {
  color: #00aaff;
  text-decoration: none;
}
</style>
