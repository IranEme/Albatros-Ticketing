<template>
  <div class="register-view">
    <div id="app-container">
      <div class="card">
        <h2>Crear nueva cuenta</h2>
        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <label for="nombre">Nombre completo</label>
            <input 
              id="nombre"
              type="text" 
              v-model="nombre" 
              required
            >
          </div>
          <div class="input-group">
            <label for="departamento">Departamento</label>
            <input 
              id="departamento"
              type="text" 
              v-model="departamento" 
              required
            >
          </div>
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
            <label for="password">Contraseña (mín. 6 caracteres)</label>
            <input 
              id="password"
              type="password" 
              v-model="password" 
              required
            >
          </div>
          <button type="submit" :disabled="cargando">
            {{ cargando ? 'Creando Cuenta...' : 'Registrarse' }}
          </button>
        </form>
        <p v-if="errorMsg" class="estado error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="estado exito">{{ successMsg }}</p>
        <div class="links-container">
          <router-link to="/login">¿Ya tienes cuenta? Inicia sesión</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../supabase';

const nombre = ref('');
const departamento = ref('');
const email = ref('');
const password = ref('');
const cargando = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

async function handleRegister() {
  cargando.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  if (password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.';
    cargando.value = false;
    return;
  }

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        nombre: nombre.value,
        departamento: departamento.value,
      }
    }
  });

  if (error) {
    errorMsg.value = 'Error: ' + error.message;
  } else {
    successMsg.value = '¡Registro exitoso! Revisa tu correo para confirmar tu cuenta. Después, puedes iniciar sesión.';
    // Limpiamos el formulario
    nombre.value = '';
    departamento.value = '';
    email.value = '';
    password.value = '';
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

h2 {
  text-align: center;
  margin-top: 0;
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
    transition: background-color 5000s ease-in-out 0s;
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
.estado.exito { color: #fff; background-color: var(--success-color); }

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
