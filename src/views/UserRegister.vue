<template>
  <div class="register-container">
    <div class="card">
      <h2>👤 Crear Nueva Cuenta</h2>
      <form @submit.prevent="handleRegister">
        <input 
          type="text" 
          v-model="nombre" 
          placeholder="Nombre Completo"
          required
        >
        <input 
          type="text" 
          v-model="departamento" 
          placeholder="Departamento"
          required
        >
        <input 
          type="email" 
          v-model="email" 
          placeholder="Email"
          required
        >
        <input 
          type="password" 
          v-model="password" 
          placeholder="Contraseña (mín. 6 caracteres)"
          required
        >
        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Creando Cuenta...' : 'Registrarse' }}
        </button>
      </form>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
      <p class="login-link">
        ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
      </p>
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
.register-container {
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
  background: #28a745;
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
