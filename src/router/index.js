import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '../views/UserLogin.vue'
import UserRegister from '../views/UserRegister.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import UpdatePassword from '../views/UpdatePassword.vue'
import TicketForm from '../components/TicketForm.vue'
import AdminLayout from '../views/AdminLayout.vue' // Importar AdminLayout
import AdminDashboard from '../views/AdminDashboard.vue'
import { supabase } from '../supabase' // Importar supabase

const routes = [
  // Rutas de Usuario
  {
    path: '/',
    name: 'Home',
    component: TicketForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: UserLogin
  },
  {
    path: '/register',
    name: 'Register',
    component: UserRegister
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/update-password',
    name: 'UpdatePassword',
    component: UpdatePassword
  },
  // Rutas de Administrador
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAdmin: true } // Esta ruta requiere ser admin
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Guardia de navegación
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  // --- ADVERTENCIA DE SEGURIDAD: ESTO NO ES SEGURO PARA PRODUCCIÓN ---
  // Para desarrollo local, se permite el acceso de admin si el email coincide.
  // En producción, la verificación de roles debe hacerse en el backend.
  const isAdminHardcoded = session?.user?.email.trim().toLowerCase() === 'iranmercado6@gmail.com';

  if (requiresAdmin) {
    if (isAdminHardcoded) { // Usamos el email hardcodeado para admin
      next(); // El usuario es admin, permite el acceso
    } else {
      // No es admin, redirige al login principal
      next({ name: 'Login' });
    }
  } else if (requiresAuth) {
    if (session) {
      next(); // Hay sesión de usuario, permite el acceso
    } else {
      // No hay sesión, redirige al login de usuario
      next({ name: 'Login' });
    }
  } else {
    // Si la ruta no requiere autenticación, permite el acceso
    next();
  }
});

export default router
