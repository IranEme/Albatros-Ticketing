<template>
  <div class="update-password-container">
    <div class="card">
      <h2>🔑 Actualizar Contraseña</h2>
      <form @submit.prevent="handlePasswordUpdate">
        <p v-if="!session">Por favor, haz clic en el enlace de tu correo electrónico para restablecer tu contraseña.</p>
        <template v-else>
          <input 
            type="password" 
            v-model="newPassword" 
            placeholder="Nueva Contraseña"
            required
          >
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="Confirmar Contraseña"
            required
          >
          <button type="submit" :disabled="cargando">
            {{ cargando ? 'Actualizando...' : 'Actualizar Contraseña' }}
          </button>
        </template>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();
const newPassword = ref('');
const confirmPassword = ref('');
const cargando = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const session = ref(null); // Para verificar si hay una sesión activa (después de hacer clic en el enlace del correo)

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  session.value = data.session;
});

async function handlePasswordUpdate() {
  cargando.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden.';
    cargando.value = false;
    return;
  }

  if (newPassword.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.';
    cargando.value = false;
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    });

    if (error) {
      throw error;
    }

    successMsg.value = '¡Contraseña actualizada con éxito! Redirigiendo al login...';
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 3000);
  } catch (error) {
    errorMsg.value = 'Error al actualizar la contraseña: ' + error.message;
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.update-password-container {
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
