<template>
  <div class="dashboard-container">
    <header>
      <h1>Panel de Administrador</h1>
      <button @click="handleLogout">Cerrar Sesión</button>
    </header>

    <div v-if="cargando" class="loading">Cargando tickets...</div>
    
    <div v-if="error" class="error-msg">{{ error }}</div>

    <div v-if="tickets.length > 0" class="tickets-table">
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
            <td>{{ ticket.id }}</td>
            <td>{{ new Date(ticket.created_at).toLocaleString() }}</td>
            <td>{{ ticket.requester_name }}</td>
            <td>{{ ticket.departamento }}</td>
            <td><span :class="['priority', ticket.priority.toLowerCase()]">{{ ticket.priority }}</span></td>
            <td><span :class="['status', ticket.status.toLowerCase().replace(' ', '-')]">{{ ticket.status }}</span></td>
            <td class="description">{{ ticket.description }}</td>
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
                {{ ticket.updating ? '...' : 'Cerrar Ticket' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
     <div v-else-if="!cargando && tickets.length === 0">
      <p>🎉 ¡No hay tickets para mostrar!</p>
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
.dashboard-container {
  padding: 2rem;
  max-width: 1400px;
  margin: auto;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
header button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}
.loading, .error-msg {
  text-align: center;
  padding: 1rem;
}
.tickets-table table {
  width: 100%;
  border-collapse: collapse;
  background: #333;
}
th, td {
  padding: 12px 15px;
  border-bottom: 1px solid #444;
  text-align: left;
  vertical-align: middle;
}
th {
  background: #444;
}
.description {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.priority, .status {
  padding: 5px 10px;
  border-radius: 15px;
  color: white;
  font-weight: 500;
  font-size: 0.85em;
  text-align: center;
  display: inline-block;
}
.priority.baja { background-color: #28a745; }
.priority.media { background-color: #ffc107; color: #333; }
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
  border-radius: 5px;
  cursor: pointer;
  color: white;
  font-weight: bold;
  width: 120px;
}
.action-btn:disabled {
  background: #555;
  cursor: not-allowed;
}
.accept-btn {
  background: #17a2b8;
}
.close-btn {
  background: #dc3545;
}
</style>
