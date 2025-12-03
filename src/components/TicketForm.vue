<template>
  <div id="app-container">
    <div class="card">
      <header class="form-header">
        <div class="user-info">
          <p>Conectado como:</p>
          <strong>{{ nombre }}</strong>
        </div>
        <button @click="handleLogout" class="logout-btn">Cerrar Sesión</button>
      </header>

      <h2>📝 Crear Nuevo Ticket de Soporte</h2>
      
      <form @submit.prevent="crearTicket">
        <input 
          type="text" 
          v-model="nombre" 
          placeholder="Tu Nombre"
          required
          readonly
        >
        <input 
          type="email" 
          v-model="email" 
          placeholder="Tu Email"
          required
          readonly
        >
        <textarea 
          v-model="descripcion" 
          rows="5" 
          placeholder="Describe tu problema..."
          required
        ></textarea>
        
        <select v-model="prioridad" required>
          <option disabled value="">Selecciona la Prioridad</option>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Urgente">Urgente</option>
        </select>
        
        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Enviando Ticket...' : '🚀 Enviar Ticket' }}
        </button>
      </form>

      <p v-if="estado" class="estado" :class="estado.tipo">{{ estado.texto }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();

// --- CONFIGURACIÓN DE RED LOCAL (para SMS Urgentes) ---
const IP_DEL_CELULAR = "IP_DEL_CELULAR_AQUI"; 
const PUERTO = "3000";
// -----------------------------------------------------

const nombre = ref('');
const email = ref('');
const departamento = ref('');
const descripcion = ref('');
const prioridad = ref('Baja');
const cargando = ref(false);
const estado = ref(null);

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    email.value = session.user.email;
    nombre.value = session.user.user_metadata.nombre || session.user.email.split('@')[0];
    departamento.value = session.user.user_metadata.departamento || 'No especificado';
  }
});

async function handleLogout() {
  await supabase.auth.signOut();
  router.push({ name: 'Login' });
}

async function enviarNotificacionSms(ticketDescripcion) {
  if (IP_DEL_CELULAR === "IP_DEL_CELULAR_AQUI") {
    console.warn('⚠️ IP del celular no configurada. No se enviará notificación SMS.');
    return;
  }

  try {
    const mensajeSms = `Nuevo Ticket URGENTE: ${ticketDescripcion.substring(0, 100)}... Contacto: ${nombre.value} (${email.value})`;
    const response = await fetch(`http://${IP_DEL_CELULAR}:${PUERTO}/enviar-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numero: "+526462862491", // ¡IMPORTANTE! Reemplaza con el número que recibirá las alertas
        mensaje: mensajeSms,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Error del servidor SMS: ${response.statusText}`);
    }
    console.log('✅ Notificación SMS urgente enviada.');

  } catch (error) {
    console.error('❌ Falló el envío de notificación SMS urgente:', error);
  }
}

async function crearTicket() {
  if (IP_DEL_CELULAR === "IP_DEL_CELULAR_AQUI" && prioridad.value === 'Urgente') {
    estado.value = { texto: '⚠️ Para tickets Urgentes, debes configurar la IP del celular.', tipo: 'error' };
    return;
  }

  cargando.value = true;
  estado.value = { texto: 'Creando ticket...', tipo: 'info' };

  try {
    const { error } = await supabase
      .from('tickets')
      .insert([
        { 
          requester_name: nombre.value,
          requester_email: email.value,
          departamento: departamento.value,
          description: descripcion.value,
          priority: prioridad.value,
          status: 'Abierto'
        }
      ]);

    if (error) throw error;

    estado.value = { texto: '✅ Ticket creado con éxito.', tipo: 'exito' };
    
    if (prioridad.value === 'Urgente') {
      await enviarNotificacionSms(descripcion.value);
    }

    descripcion.value = '';
    prioridad.value = 'Baja';

  } catch (error) {
    estado.value = { texto: `❌ Error al crear ticket: ${error.message}`, tipo: 'error' };
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
#app-container {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.card {
  background: #333;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  width: 420px;
}
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #444;
  padding: 10px 15px;
  border-radius: 5px;
  margin-bottom: 1.5rem;
}
.user-info p {
  margin: 0;
  font-size: 0.8em;
  color: #ccc;
}
.user-info strong {
  margin: 0;
  font-size: 0.9em;
}
.logout-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin: 0;
}
input, button, textarea, select {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  box-sizing: border-box;
  border-radius: 5px;
  border: none;
  font-size: 1em;
}
input, textarea, select {
  background: #444;
  color: white;
}
input[readonly] {
  background: #555;
  cursor: not-allowed;
}
button[type="submit"] {
  background: #28a745;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
button:disabled {
  background: #555;
  cursor: not-allowed;
}
h2 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 1.5rem;
}
.estado {
  text-align: center;
  margin-top: 10px;
  font-size: 0.9em;
  padding: 10px;
  border-radius: 5px;
}
.estado.exito { color: #fff; background-color: #4caf50; }
.estado.error { color: #fff; background-color: #ff5252; }
.estado.info { color: #fff; background-color: #5a5a5a; }
</style>
