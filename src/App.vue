<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Login from './components/Login.vue'
import EmployeesCrud from './components/EmployeesCrud.vue'
import RolesCrud from './components/RolesCrud.vue'
import { cerrarSesion, haySesionActiva, obtenerUsuarioGuardado } from './services/auth.service'

const usuario = ref(haySesionActiva() ? obtenerUsuarioGuardado() : null)
const vista = ref('empleados')

function alLogin(user) {
  usuario.value = user
  vista.value = 'empleados'
}

function alCerrarSesion() {
  cerrarSesion()
  usuario.value = null
}

function alExpirarSesion() {
  usuario.value = null
}

onMounted(() => window.addEventListener('sesion-expirada', alExpirarSesion))
onUnmounted(() => window.removeEventListener('sesion-expirada', alExpirarSesion))
</script>

<template>
  <main>
    <Login v-if="!usuario" @login="alLogin" />

    <template v-else>
      <div class="barra-sesion">
        <span class="sesion-info">
          Sesión: <strong>{{ usuario.username }}</strong> ({{ usuario.role }})
        </span>
        <nav class="tabs">
          <button :class="{ activo: vista === 'empleados' }" @click="vista = 'empleados'">Empleados</button>
          <button :class="{ activo: vista === 'roles' }" @click="vista = 'roles'">Roles</button>
        </nav>
        <button class="btn-salir" @click="alCerrarSesion">Cerrar sesión</button>
      </div>

      <EmployeesCrud v-if="vista === 'empleados'" />
      <RolesCrud v-else />
    </template>
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
  padding: 24px 16px;
}

.barra-sesion {
  max-width: 900px;
  margin: 0 auto 16px auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  border: 1px solid #ccc;
  background: #fff;
  padding: 8px 14px;
  font-size: 13px;
}

.sesion-info {
  color: #333;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tabs button {
  border: 1px solid #ccc;
  background: #f4f4f4;
  padding: 5px 14px;
  cursor: pointer;
  font-size: 13px;
}

.tabs button.activo {
  background: #111;
  color: #fff;
  border-color: #111;
}

.btn-salir {
  border: 1px solid #111;
  background: #fff;
  padding: 5px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.btn-salir:hover {
  background: #111;
  color: #fff;
}
</style>
