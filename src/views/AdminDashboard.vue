<template>
  <div class="dashboard-view">
    <header class="top-bar">
      <div class="top-bar-content">
        <img src="/loog negro.jpg" alt="Logo Albatros Ticketing" class="top-bar-logo">
        <h1 class="welcome-title">Panel de Administrador</h1>
        <button @click="handleLogout" class="logout-btn">Cerrar Sesión</button>
      </div>
    </header>

    <div class="dashboard-container">
      <div v-if="cargando" class="loading">Cargando tickets...</div>
      
      <div v-if="error" class="estado error">{{ error }}</div>

      <div v-if="tickets.length > 0" class="tickets-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Solicitante</th>
              <th>Departamento</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in tickets" :key="ticket.id">
              <td>#{{ ticket.id }}</td>
              <td>{{ new Date(ticket.created_at).toLocaleString() }}</td>
              <td>{{ ticket.requester_name }}</td>
              <td>{{ ticket.departamento }}</td>
              <td><span :class="['priority', ticket.priority.toLowerCase()]">{{ ticket.priority }}</span></td>
              <td><span :class="['status', ticket.status.toLowerCase().replace(' ', '-')]">{{ ticket.status }}</span></td>
              <td class="description" :title="ticket.description">{{ ticket.description }}</td>
              <td class="actions">
                <button 
                  v-if="ticket.status === 'Abierto'" 
                  @click="changeStatus(ticket, 'En Progreso')"
                  :disabled="ticket.updating"
                  class="action-btn accept-btn">
                  {{ ticket.updating ? '...' : 'Aceptar' }}
                </button>
                <button 
                  v-if="ticket.status === 'En Progreso'" 
                  @click="changeStatus(ticket, 'Cerrado')"
                  :disabled="ticket.updating"
                  class="action-btn close-btn">
                  {{ ticket.updating ? '...' : 'Cerrar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="!cargando && tickets.length === 0" class="no-tickets-msg">
        <p>🎉 ¡No hay tickets para mostrar!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, getTickets, updateTicketStatus } from '../supabase';

const router = useRouter();
const tickets = ref([]);
const cargando = ref(true);
const error = ref('');

onMounted(async () => {
  cargando.value = true;
  const { data, error: fetchError } = await getTickets();
  if (fetchError) {
    error.value = 'Error al cargar los tickets: ' + fetchError.message;
  } else {
    tickets.value = data.map(ticket => ({ ...ticket, updating: false }));
  }
  cargando.value = false;
});

async function changeStatus(ticket, newStatus) {
  ticket.updating = true;
  
  const { data, error: updateError } = await updateTicketStatus(ticket.id, newStatus);

  if (updateError) {
    alert('Error al actualizar el estado: ' + updateError.message);
  } else {
    // Actualizamos el estado en la UI localmente
    const index = tickets.value.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      tickets.value[index].status = data.status;
    }
  }
  
  ticket.updating = false;
}

async function handleLogout() {
  await supabase.auth.signOut();
  router.push({ name: 'Login' });
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
  max-width: 1400px;
  margin: 0 auto;
}

.top-bar-logo {
  height: 80px;
  margin-right: 20px;
}

.welcome-title {
  color: var(--primary-text-color);
  font-size: 1.8em;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  margin: 0 auto;
  text-align: center;
  flex-grow: 1;
}

.logout-btn {
  background: #ffffff;
  color: #121212;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: bold;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: var(--accent-color);
  color: #ffffff;
  box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.2);
}

/* Contenedor principal */
.dashboard-container {
  padding: 2rem;
  padding-top: 180px; /* Más espacio para la barra superior */
  max-width: 1400px;
  margin: auto;
}

.loading, .no-tickets-msg {
  text-align: center;
  padding: 2rem;
  font-size: 1.2em;
  color: var(--secondary-text-color);
}

.tickets-table-container {
  background-color: var(--card-background);
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  text-align: left;
  vertical-align: middle;
}

thead tr {
  background-color: rgba(0,0,0,0.2);
}

th {
  color: var(--primary-text-color);
  font-weight: 600;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background-color: rgba(255,255,255,0.05);
}

.description {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
}

.priority, .status {
  padding: 6px 12px;
  border-radius: 15px;
  color: white;
  font-weight: 600;
  font-size: 0.8em;
  text-align: center;
  display: inline-block;
  text-transform: uppercase;
}

.priority.baja { background-color: #28a745; }
.priority.media { background-color: #ffc107; color: #111; }
.priority.urgente { background-color: #dc3545; }

.status.abierto { background-color: #007bff; }
.status.en-progreso { background-color: #fd7e14; }
.status.cerrado { background-color: #6c757d; }

.actions {
  width: 150px;
}

.action-btn {
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  font-weight: bold;
  width: 120px;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.5;
}

.accept-btn {
  background: #ffffff; /* Blanco */
  color: #121212; /* Texto oscuro */
}
.accept-btn:hover:not(:disabled) {
  background: var(--accent-color); /* Cian en hover */
  color: #ffffff; /* Texto blanco en hover */
}

.close-btn {
  background: #c82333;
}
.close-btn:hover:not(:disabled) {
  background: #dc3545;
}

.estado.error {
  text-align: center;
  margin-top: 15px;
  font-size: 0.9em;
  padding: 12px;
  border-radius: 8px;
  color: #fff;
  background-color: var(--error-color);
}
</style>
