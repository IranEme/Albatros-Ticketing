<template>
  <div class="ticket-form-view">
    <header class="top-bar">
      <div class="top-bar-content">
        <img src="/loog negro.jpg" alt="Logo Albatros Ticketing" class="top-bar-logo">
        <h1 class="welcome-title">Bienvenido a Albatros Ticketing</h1>
        <button @click="handleLogout" class="logout-btn">Cerrar Sesión</button>
      </div>
    </header>

    <div id="app-container">
      <div class="card">
        <h2>Crear nuevo ticket de soporte</h2>
        
        <form @submit.prevent="crearTicket">
          <div class="input-group">
            <label for="nombre">Nombre</label>
            <input 
              id="nombre"
              type="text" 
              v-model="nombre" 
              required
              readonly
            >
          </div>
          <div class="input-group">
            <label for="email">Email</label>
            <input 
              id="email"
              type="email" 
              v-model="email" 
              required
              readonly
            >
          </div>
          <div class="input-group">
            <label for="descripcion">Descripción del problema</label>
            <textarea 
              id="descripcion"
              v-model="descripcion" 
              rows="4" 
              required
            ></textarea>
          </div>
          
          <div class="input-group">
            <label for="prioridad">Prioridad</label>
            <div class="custom-select" @click="toggleDropdown" tabindex="0" @blur="closeDropdown">
              <div class="select-selected" :class="{ 'select-open': isDropdownOpen }">
                <span>{{ prioridad }}</span>
                <span class="select-arrow" :class="{ 'arrow-up': isDropdownOpen }"></span>
              </div>
              <div class="select-items" v-if="isDropdownOpen">
                <div v-for="option in priorityOptions" :key="option" @click.stop="selectPriority(option)">
                  {{ option }}
                </div>
              </div>
            </div>
          </div>
          
          <button type="submit" :disabled="cargando">
            {{ cargando ? 'Enviando...' : 'Enviar Ticket' }}
          </button>
        </form>

        <p v-if="estado" class="estado" :class="estado.tipo">{{ estado.texto }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();

// --- CONFIGURACIÓN DE RED LOCAL (para SMS Urgentes) ---
const IP_DEL_CELULAR = "140.10.4.98"; 
const PUERTO = "3000";
// -----------------------------------------------------

const nombre = ref('');
const email = ref('');
const departamento = ref('');
const descripcion = ref('');
const prioridad = ref('Baja');
const cargando = ref(false);
const estado = ref(null);

// --- Lógica para el menú desplegable personalizado ---
const isDropdownOpen = ref(false);
const priorityOptions = ['Baja', 'Media', 'Urgente'];

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function closeDropdown() {
  isDropdownOpen.value = false;
}

function selectPriority(option) {
  prioridad.value = option;
  closeDropdown(); // Cierra el menú al seleccionar
}
// ----------------------------------------------------


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
        numero: "+526462862491", 
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
/* Variables de Color */
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

/* --- Estilos de la Barra Superior --- */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--card-background);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
  box-sizing: border-box;
  z-index: 10000;
}

.top-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px; /* O el ancho que prefieras */
  margin: 0 auto;
}

.top-bar-logo {
  height: 80px; /* Ajustado para ser más grande */
  margin-right: 20px; /* Espacio entre el logo y la info del usuario */
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px; /* Espacio entre "Conectado como:" y el nombre */
}/* ------------------------------------ */

#app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  padding-top: 100px; /* Espacio para la barra superior fija */
  box-sizing: border-box;
}

.card {
  background: var(--card-background);
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 450px;
  border: 1px solid var(--border-color);
}

.user-info p {
  margin: 0;
  font-size: 0.9em;
  color: var(--secondary-text-color);
}

.user-info strong {
  margin: 0;
  font-size: 1em;
  color: var(--primary-text-color);
}

.logout-btn {
  background: #ffffff; /* Blanco */
  color: #121212; /* Texto oscuro */
  border: none; /* Sin borde */
  padding: 10px 18px; /* Ajustado para la barra superior */
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95em; /* Ajustado para la barra superior */
  font-weight: bold;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: var(--accent-color); /* Cian en hover */
  color: #ffffff; /* Texto blanco en hover */
  box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.2); /* Sombra sutil en hover */
}

h2 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 2rem;
  color: var(--primary-text-color);
  font-weight: 700; /* Más negrita para destacar */
  font-family: 'Montserrat', sans-serif; /* Aplicar la nueva fuente */
}

.input-group {
  position: relative;
  margin-bottom: 3.5rem; /* Aumentado para dar más espacio al desplegable */
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

input, textarea {
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
textarea:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px var(--card-background) inset !important;
    -webkit-text-fill-color: var(--primary-text-color) !important;
}

input[readonly] {
  cursor: not-allowed;
  opacity: 0.6;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.2);
}

/* --- Estilos del Menú Desplegable Personalizado --- */
.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
  user-select: none;
}

.custom-select:focus {
  outline: none;
}

.select-selected {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--input-background);
  color: var(--primary-text-color);
  padding: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px; /* Asegura bordes redondeados */
  font-size: 1em;
  transition: all 0.3s ease;
}

.select-selected.select-open,
.custom-select:focus .select-selected {
  border-color: var(--accent-color);
  box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.2);
}

.select-arrow {
  border-color: var(--secondary-text-color) transparent transparent transparent;
  border-style: solid;
  border-width: 6px 6px 0 6px;
  height: 0;
  width: 0;
  transition: transform 0.3s ease;
}

.select-arrow.arrow-up {
  transform: rotate(180deg);
}

.select-items {
  position: absolute;
  background-color: #ffffff; /* Blanco puro */
  top: calc(100% + 8px); /* Espacio debajo del campo seleccionado */
  left: 0;
  right: 0;
  z-index: 9999; /* Asegurado para que esté siempre encima */
  border: 1px solid var(--border-color);
  border-radius: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.select-items div {
  color: #121212; /* Texto oscuro para las opciones */
  padding: 12px 16px; /* Ajustar padding */
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.select-items div:hover {
  background-color: var(--accent-color);
  color: #000;
}
/* ---------------------------------------------------- */

button[type="submit"] {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  border: none;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  background-color: #ffffff; /* Blanco */
  color: #121212; /* Texto oscuro */
  transition: all 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: var(--accent-color); /* Cian en hover */
  color: #ffffff; /* Texto blanco en hover */
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

.estado.exito { color: #fff; background-color: var(--success-color); }
.estado.error { color: #fff; background-color: var(--error-color); }
.estado.info { color: #fff; background-color: #5a5a5a; }
</style>
